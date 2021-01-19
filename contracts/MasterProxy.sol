// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./proxy/Proxy.sol";
import "./IWalletFactory.sol";

/**
 * @title MasterProxy
 * @dev Gives the possibility to delegate any call to a foreign implementation.
 */
contract MasterProxy is Proxy {
    address private _master;
    address private _owner;

    constructor() public {
        _owner = msg.sender;
    }

    function init(address master) external {
        require(_owner == address(0));
        _master = master;
    }

     function implementation() public override view returns (address) {
         return IWalletFactory(_master).getWallet();
     }
}