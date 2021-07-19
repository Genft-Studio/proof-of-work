import logo from './logo.svg';
import './App.css';
import TokenMiner from "./TokenMiner";
import {useState} from "react";

const testAddress =       '0x28e22396C45Ac478C70F3fdD438c56af2F8B50f9'
const testLastHash =      '0x0000000000000000000000000000000000000000000000000000000000000000'
const testBlockHash =     '0xc499146fd941b6a40f711004cea16fcbc1e0f62f938a4725344d45bf57a1afc0'
const testMaxTargetHash = '0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'


function App() {
    const onSuccess = console.log
    const [address, setAddress] = useState(testAddress)
    const [lastHash, setLastHash] = useState(testLastHash)
    const [blockHash, setBlockHash] = useState(testBlockHash)
    const [maxTargetHash, setMaxTargetAddress] = useState(testMaxTargetHash)
    return (
        <div className="App">
            <header className="App-header">
                <TokenMiner
                    address={address}
                    lastHash={lastHash}
                    recentBlockHash={blockHash}
                    maxTargetHash={maxTargetHash}
                    onSuccess={onSuccess}/>
            </header>
            <div>
                <input name='address' value={address} onChange={e => setAddress(e.target.value)}/>
            </div>
        </div>
    );
}

export default App;
