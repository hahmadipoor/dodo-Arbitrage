// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IFlashloan.sol";
import "../interfaces/IDODO.sol";
import "../libraries/RouteUtils.sol";

contract DodoBase is IFlashloan {
    //Note: CallBack function executed by DODOV2(DVM) flashLoan pool
    function DVMFlashLoanCall(
        address sender,
        uint256 baseAmount,
        uint256 quoteAmount,
        bytes calldata data
    ) external {
        _flashLoanCallBack(sender, baseAmount, quoteAmount, data);
    }

    //Note: CallBack function executed by DODOV2(DPP) flashLoan pool
    function DPPFlashLoanCall(
        address sender,
        uint256 baseAmount,
        uint256 quoteAmount,
        bytes calldata data
    ) external {
        _flashLoanCallBack(sender, baseAmount, quoteAmount, data);
    }

    //Note: CallBack function executed by DODOV2(DSP) flashLoan pool
    function DSPFlashLoanCall(
        address sender,
        uint256 baseAmount,
        uint256 quoteAmount,
        bytes calldata data
    ) external {
        _flashLoanCallBack(sender, baseAmount, quoteAmount, data);
    }

    // This function is virtual, so it's not gonna have any body; it's goanna be overrided by the FlashLoan contract 
    function _flashLoanCallBack( address, uint256, uint256, bytes calldata data) internal virtual {
    } 

    modifier checkParams(FlashParams memory params) {
        address loanToken = RouteUtils.getInitialToken(params.routes[0]);
        bool loanEqBase = loanToken == IDODO(params.flashLoanPool)._BASE_TOKEN_();
        bool loanEqQuote = loanToken ==  IDODO(params.flashLoanPool)._QUOTE_TOKEN_();
        require(loanEqBase || loanEqQuote, "Wrong flashloan pool address");
        _;
    }
}