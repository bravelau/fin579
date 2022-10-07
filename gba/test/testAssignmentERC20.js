const {expect} = require("chai");
const {ethers} = require("hardhat");

describe ("Test AssignmentERC20", ()=>{
    let accounts;
    let wndr;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        let factory = await ethers.getContractFactory("AssignmentERC20");
        
        wndr = await factory.deploy(
            "Assignment ERC20 token",
            "WNDR",
            accounts[0].address
        );
    });

    it ("Account 0 can mint token", async ()=>{
        const before = await wndr.balanceOf(accounts[1].address);
        const response = await wndr.mint(accounts[1].address, 100);
        await response.wait();

        //Assert
        const after = await wndr.balanceOf(accounts[1].address);
        expect (before.add(100).toNumber()).equals(after.toNumber());
    });

    it ("Account 1 cannot mint token", async ()=>{
        try {
            await wndr.connect(accounts[1]).mint(accounts[1].address, 100);
        } catch (err){
            expect (err.toString().includes("Ownable: caller is not the owner"));
        }
    });

    it ("can mint after transferOwnership", async() => {
        const before = await wndr.balanceOf(accounts[1].address);
        await wndr.transferOwnership(accounts[1].address);

        const response = await wndr
            .connect(accounts[1])
            .mint(accounts[1].address, 100);

        await response.wait()

        //Assert
        const after = await wndr.balanceOf(accounts[1].address);
        expect (before.add(100).toNumber()).equals(after.toNumber());
    });
});






