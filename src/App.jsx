import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
// import { Web3Provider } from "@ethersproject/providers";
import abi from './utils/WavePortal.json'

export default function App() {
  const [state, setState] = useState({
    currentAccount: "",
    count: 0,
    allWaves: [],
    userMessage: ""
  })
  
  const contractAddress = "0xE90E5d8a1579d247F881fcC826f56EAEde61407D"
  const contractABI = abi.abi

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])
    
  async function checkIfWalletIsConnected() {
    try {
      const {ethereum} = window
      if(!ethereum) { 
        console.log("Wallet is not connected")
        return
      } else {
        console.log("Wallet is connected : ", ethereum)
        
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const newCount = await wavePortalContract.getTotalWaves()
        setState(prevState => {
          return {
            ...prevState,
            count: newCount.toNumber()
          }
        })
      }

      const accounts = await ethereum.request({method : "eth_accounts"})

      if(accounts.length !=0) {
        const account = accounts[0]
        console.log("Found an authorized account: ", account)
        setState(prevState => {
          return {
            ...prevState,
            currentAccount: account
          }
        })
        getAllWaves()
      } else {
        console.log("No authorised account found")
      }
        
    } catch (error) {
      console.log(error)
    }
  }

  async function connectWallet() {
    try {
      const {ethereum} = window
      if(!ethereum) {
        console.log("Get MetaMask")
        return
      } 

      const accounts = await ethereum.request({method: "eth_requestAccounts"})

      console.log("Connected : ", accounts[0])
      setState(prevState => {
        return {
          ...prevState,
          currentAccount: account
        }
      })
      
    } catch(error) {
      console.log(error)
      alert("Log in to Metamask")
    }
  }
  
  async function wave() {
    try {
      const {ethereum} = window

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const waveTxn = await wavePortalContract.wave(state.userMessage, { gasLimit: 300000 })
        console.log("Mining...", waveTxn.hash)

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash)

        const newCount = await wavePortalContract.getTotalWaves()
        setState(prevState => {
          return {
            ...prevState,
            count: newCount.toNumber()
          }
        })
        getAllWaves()
        
      } else {
        console.log("Ethereum object doesnt exist")
      }
      
    } catch(error) {
      console.log(error)
      alert("Log in to Metamask")
    }   
  }

  async function getAllWaves() {
    try {
      const {ethereum} = window
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const waves = await wavePortalContract.getAllWaves()

        let wavesCleaned = []
        if(waves.length){
          waves.forEach(wave => {
            wavesCleaned.push({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message
            })
          })
        }
        console.log(wavesCleaned)
        setState(prevState => {
          return {
            ...prevState,
            allWaves: wavesCleaned
          }
        })
      } else {
        console.log("Ethereum object doesn't exist")
      }
      
    } catch(error) {
      console.log(error)
    }
  }

  function handleClick() {
    if(state.userMessage) {
      wave()
      setState(prevState => {
        return {
          ...prevState,
          userMessage: ""
        }
      })
    } else{
      alert("Please type in a message first!")
    }
  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Vijaypal Singh Negi. Wave hello to me. 
        <br/>
        Total number of waves: {state.count}
        </div>
        
        <textarea 
          className="userMessage"
          value={state.userMessage}
          placeholder="Don't forget to send a message!"
          onChange={(event) => setState(prevState => {
            return {
              ...prevState,
              userMessage: event.target.value
            }
        })}
        />

        <button className="waveButton" onClick={handleClick}>
          Wave at Me
        </button>

        {!state.currentAccount &&
        <button className="waveButton" onClick = {connectWallet}>Connect Wallet</button>
        }

        <div className="wavesContainer">
          {state.allWaves.slice(0).reverse().map((wave, index) => {
            return (
              <div key={index} className = "waves">
                <div><b>Address: </b>{wave.address}</div>
                <div><b>Time: </b>{wave.timestamp.toString()}</div>
                <div><b>Message: </b>{wave.message}</div>
              </div>)
          })}
        </div>
        
      </div>
    </div>
  );
}
