import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import { useRouter } from "next/router";

import { VotingAddress, VotingAddressABI } from "./constants";

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext();

export const VotingProvider = ({ children }) => {
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState("");
  const [candidateLength, setCandidateLength] = useState("");
  const pushCandidate = [];
  const candidateIndex = [];
  const [candidateArray, setCandidateArray] = useState(pushCandidate);
  // =========================================================
  //---HATA MESAJ
  const [error, setError] = useState("");
  const higestVote = [];

  const pushVoter = [];
  const [voterArray, setVoterArray] = useState(pushVoter);
  const [voterLength, setVoterLength] = useState("");
  const [voterAddress, setVoterAddress] = useState([]);
  ///METAMASK BAĞLA
  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setError("Lütfen metamask yükleyin");

    const account = await window.ethereum.request({ method: "eth_accounts" });

    if (account.length) {
      setCurrentAccount(account[0]);
      getAllVoterData();
      getNewCandidate();
    } else {
      setError("Lütfen metamask yükleyin ve refresh atın");
    }
  };

  // ===========================================================
  //CÜZDAN BAĞLA
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Lütfen metamask yükleyin");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(accounts[0]);
    getAllVoterData();
    getNewCandidate();
  };
  // ================================================

  const uploadToIPFS = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `f66c278f91a9372a22c7`,
            pinata_secret_api_key: `
            0fa6745d936f1e7e140ac6f4497ac9900fdeee155232f9f703be7891fab8609a`,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

        return ImgHash;
      } catch (error) {
        console.log("Resim pinataya yüklenemedi.");
      }
    }
  };

  const uploadToIPFSCandidate = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `f66c278f91a9372a22c7`,
            pinata_secret_api_key: `
            0fa6745d936f1e7e140ac6f4497ac9900fdeee155232f9f703be7891fab8609a`,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

        return ImgHash;
      } catch (error) {
        console.log("Pinataya resim yüklenemedi");
      }
    }
  };

  // =============================================
  //Seçmen oluştur----------------------
  const createVoter = async (formInput, fileUrl) => {
    try {
      const { name, address, position } = formInput;

      if (!name || !address || !position)
        return console.log("Giriş bilgisi eksik.");

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const data = JSON.stringify({ name, address, position, image: fileUrl });

      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `f66c278f91a9372a22c7`,
          pinata_secret_api_key: `
        0fa6745d936f1e7e140ac6f4497ac9900fdeee155232f9f703be7891fab8609a`,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      const voter = await contract.voterRight(address, name, url, fileUrl);
      voter.wait();

      router.push("/voterList");
    } catch (error) {
      console.log(error);
    }
  };
  // =============================================

  const getAllVoterData = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      //Seçmen listesi
      const voterListData = await contract.getVoterList();
      setVoterAddress(voterListData);

      voterListData.map(async (el) => {
        const singleVoterData = await contract.getVoterData(el);
        pushVoter.push(singleVoterData);
      });

      //Seçmen Listesi Uzunluk
      const voterList = await contract.getVoterLength();
      setVoterLength(voterList.toNumber());
    } catch (error) {
      console.log("All data");
    }
  };

  // =============================================

  // =============================================
  //////// OY VER

  const giveVote = async (id) => {
    try {
      const voterAddress = id.address;
      const voterId = id.id;
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const voteredList = await contract.vote(voterAddress, voterId);
      console.log(voteredList);
    } catch (error) {
      setError("Üzgünüz daha önce oy kullandınız.");
    }
  };
  // =============================================

  const setCandidate = async (candidateForm, fileUrl, router) => {
    const { name, address, age } = candidateForm;

    if (!name || !address || !age) return console.log("Giriş bilgisi eksik.");

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = JSON.stringify({
      name,
      address,
      image: fileUrl,
      age,
    });

    const response = await axios({
      method: "POST",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data: data,
      headers: {
        pinata_api_key: `f66c278f91a9372a22c7`,
        pinata_secret_api_key: `
      0fa6745d936f1e7e140ac6f4497ac9900fdeee155232f9f703be7891fab8609a`,
        "Content-Type": "application/json",
      },
    });

    const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

    const candidate = await contract.setCandidate(
      address,
      age,
      name,
      fileUrl,
      url
    );
    candidate.wait();

    router.push("/");
  };

  const getNewCandidate = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

  
    const allCandidate = await contract.getCandidate();


    allCandidate.map(async (el) => {
      const singleCandidateData = await contract.getCandidateData(el);

      pushCandidate.push(singleCandidateData);
      candidateIndex.push(singleCandidateData[2].toNumber());
    });


    const allCandidateLength = await contract.getCandidateLength();
    setCandidateLength(allCandidateLength.toNumber());
  };

  return (
    <VotingContext.Provider
      value={{
        currentAccount,
        connectWallet,
        uploadToIPFS,
        createVoter,
        setCandidate,
        getNewCandidate,
        giveVote,
        pushCandidate,
        candidateArray,
        uploadToIPFSCandidate,
        getAllVoterData,
        voterArray,
        giveVote,
        checkIfWalletIsConnected,
        error,
        candidateLength,
        voterLength,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
