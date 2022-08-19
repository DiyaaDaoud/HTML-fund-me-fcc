import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";
const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const getbalanceButton = document.getElementById("getbalanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
getbalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected!";
    } else {
        connectButton.innerHTML = "Please install metamsk!";
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}`);
    if (typeof window.ethereum !== "undefined") {
        // here we need:
        // 1- provider / connection to the blockchain
        // 2- signer / wallet - someone with some gas
        // 3- contract to interact with : ABI + address
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            // to tell the front-end user that the transaction is done, we need to:
            // 1- listen for the tx to be mined
            // 2- or we can listen for an event
            await listenForTransactionMined(transactionResponse, provider);
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    }
}
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(
            `the contract balance is ${ethers.utils.formatEther(balance)} ETH.`
        );
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            console.log("withdrawing ...");
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMined(transactionResponse, provider);
            console.log("GOT IT!!!");
        } catch (error) {
            console.log(error);
        }
    }
}

function listenForTransactionMined(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash} ...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations.`
            );
            resolve();
        });
    });
}
