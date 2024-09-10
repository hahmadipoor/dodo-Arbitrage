// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IFlashloan.sol";
import "./interfaces/IDODOProxy.sol";
import "./interfaces/IDODO.sol";

import "./base/DodoBase.sol";
import "./base/FlashloanValidation.sol";
import "./base/Withdraw.sol";

import "./libraries/Part.sol";
import "./libraries/RouteUtils.sol";
import "hardhat/console.sol";

import "./uniswap/v3/ISwapRouter.sol";
import "./uniswap/IUniswapV2Router.sol";

import "@openzeppelin/contracts/utils/math/SignedMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDODO.sol";


contract Flashloan is IFlashloan, DodoBase, FlashloanValidation, Withdraw {
    // using SafeMath for uint256;
    using SignedMath for uint256;
    // using SafeERC20 for IERC20;
 
    event SentProfit(address recipient, uint256 profit);
    event SwapFinished(address token, uint256 amount);

    constructor() {
        console.log("constructor is calleddd");
    }
    
    function executeFlashloan(FlashParams memory params) external checkParams(params) {
        bytes memory data = abi.encode(
            FlashParams({
                flashLoanPool: params.flashLoanPool,
                loanAmount: params.loanAmount,
                routes: params.routes
            })
        );
        console.log(params.flashLoanPool);
        address loanToken = RouteUtils.getInitialToken(params.routes[0]);
        console.log("CONTRACT BALANCE Before BORROW",IERC20(params.flashLoanPool).balanceOf(address(this)));
        //approveToken(loanToken, params.flashLoanPool, params.loanAmount);
        IDODO(params.flashLoanPool).flashLoan(
            IDODO(params.flashLoanPool)._BASE_TOKEN_() == loanToken ? params.loanAmount: 0,// amount of base token that user wants to borrow
            IDODO(params.flashLoanPool)._BASE_TOKEN_() == loanToken? 0 : params.loanAmount,// amount of quote token that user wants to borrow
            address(this),
            data
        );
    }

    function _flashLoanCallBack(
        address,
        uint256,
        uint256,
        bytes calldata data
    ) internal override {
        console.log("--------------callback is called--------------------");
        FlashParams memory decoded = abi.decode( data, (FlashParams));
        address loanToken = RouteUtils.getInitialToken(decoded.routes[0]);
        console.log(IERC20(loanToken).balanceOf(address(this)), "LOAN_TOKEN CONTRACT BALANCE BEFORE SWAP");
        require( IERC20(loanToken).balanceOf(address(this)) >= decoded.loanAmount,"Failed to borrow loan token");
        routeLoop(decoded.routes, decoded.loanAmount);
        console.log("routeLoop finished");
        console.log("LOAN_TOKEN CONTRACT BALANCE AFTER BORROW AND SWAP", IERC20(loanToken).balanceOf(address(this)));
        emit SwapFinished(loanToken,IERC20(loanToken).balanceOf(address(this)));
        require( IERC20(loanToken).balanceOf(address(this)) >= decoded.loanAmount,"Not enough amount to return loan");
        IERC20(loanToken).transfer(decoded.flashLoanPool, decoded.loanAmount);
        console.log("LOAN_TOKEN CONTRACT BALANCE AFTER REPAY", IERC20(loanToken).balanceOf(address(this)));
        uint256 remained = IERC20(loanToken).balanceOf(address(this));
        //IERC20(loanToken).transfer(owner(), remained);
        emit SentProfit(owner(), remained);
        console.log("++++++++++++End of callback+++++++++++++++++++++++++");
    }

    function routeLoop(Route[] memory routes, uint256 totalAmount) internal checkTotalRoutePart(routes) {
        console.log("inside routeLoop");
        for (uint256 i = 0; i < routes.length; i++) {
            uint256 amountIn = Part.partToAmountIn(routes[i].part, totalAmount);
            console.log(totalAmount, "LOAN TOKEN AMOUNT to SWAP");
            hopLoop(routes[i], amountIn);
        }
    }

    function hopLoop(Route memory route, uint256 totalAmount) internal {
        uint256 amountIn = totalAmount;
        for (uint256 i = 0; i < route.hops.length; i++) {
            amountIn = pickProtocol(route.hops[i], amountIn);
        }
    }


    function pickProtocol( Hop memory hop, uint256 amountIn) internal checkRouteProtocol(hop) returns (uint256 amountOut) {
        if (hop.protocol == 0) {
            amountOut = uniswapV3(hop.data, amountIn, hop.path);
        } else if (hop.protocol < 8) {
            amountOut = uniswapV2(hop.data, amountIn, hop.path);
        } else {
            amountOut = dodoV2Swap(hop.data, amountIn, hop.path);
        }
    }

    function uniswapV3(
        bytes memory data,
        uint256 amountIn,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        (address router, uint24 fee) = abi.decode(data, (address, uint24));
        ISwapRouter swapRouter = ISwapRouter(router);
        approveToken(path[0], address(swapRouter), amountIn);

        // single swaps
        amountOut = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: path[0],
                tokenOut: path[1],
                fee: fee,
                recipient: address(this),
                deadline: block.timestamp +60,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
    }

    function uniswapV2(
        bytes memory data,
        uint256 amountIn,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        address router = abi.decode(data, (address));
        approveToken(path[0], router, amountIn);
        amountOut=IUniswapV2Router(router).swapExactTokensForTokens(
                amountIn,
                0,
                path,
                address(this),
                block.timestamp +60
            )[1];
    }

    function dodoV2Swap(
        bytes memory data,
        uint256 amountIn,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        (address dodoV2Pool, address dodoApprove, address dodoProxy) = abi.decode(data, (address, address, address));
        address[] memory dodoPairs = new address[](1); //one-hop
        dodoPairs[0] = dodoV2Pool;
        uint256 directions = IDODO(dodoV2Pool)._BASE_TOKEN_() == path[0] ? 0 : 1;
        approveToken(path[0], dodoApprove, amountIn);
        amountOut = IDODOProxy(dodoProxy).dodoSwapV2TokenToToken(
            path[0],
            path[1],
            amountIn,
            1,
            dodoPairs,
            directions,
            false,
            block.timestamp +60
        );
    }

    function approveToken(
        address token,
        address to,
        uint256 amountIn
    ) internal {
        require(IERC20(token).approve(to, amountIn), "approve failed.");
    }

    // fallback() external payable { 
    //     console.log(msg.sender); 
    // }
}