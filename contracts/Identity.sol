// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Identity {
    enum Role { None, Citizen, Officer, Admin }

    struct User {
        string name;
        string ipfsHash;
        Role role;
        bool isVerified;
    }

    mapping(address => User) public users;
    address[] public userAddresses;

    address public contractOwner;

    constructor() {
        contractOwner = msg.sender;
        users[msg.sender].role = Role.Admin;
    }

    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.Admin, "Yetkisiz erisim: Admin degilsiniz");
        _;
    }

    modifier onlyOfficerOrAdmin() {
        Role r = users[msg.sender].role;
        require(r == Role.Admin || r == Role.Officer, "Erisim reddedildi");
        _;
    }

    function register(string memory _name, string memory _ipfsHash, Role _role) public {
        require(bytes(users[msg.sender].name).length == 0, "Bu adres zaten kayitli!");
        users[msg.sender] = User(_name, _ipfsHash, _role, false);
        userAddresses.push(msg.sender);
        users[msg.sender].isVerified = false;

    }

    function updateUser(string memory _name, string memory _ipfsHash) public {
        require(bytes(users[msg.sender].name).length != 0, "Kayit bulunamadi!");
        users[msg.sender].name = _name;
        users[msg.sender].ipfsHash = _ipfsHash;
    }

    function getUser(address _user) public view returns (string memory, string memory, Role, bool) {
    User memory u = users[_user];
    return (u.name, u.ipfsHash, u.role, u.isVerified);
    }


    function getAllUsers() public view returns (address[] memory) {
        return userAddresses;
    }

    function setUserRole(address _user, Role _role) public onlyAdmin {
        require(bytes(users[_user].name).length != 0, "Kullanici bulunamadi!");
        users[_user].role = _role;
    }

    function getUserRole(address _user) public view returns (Role) {
        return users[_user].role;
    }

    function verifyUser(address _user) public onlyOfficerOrAdmin {
    require(bytes(users[_user].name).length != 0, "Kullanici bulunamadi!");
    users[_user].isVerified = true;
}

}
