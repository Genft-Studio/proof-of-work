# proof-of-work
*A proof-of-work system for smart contracts*

By Ken Hodler | [github](https://github.com/bgok) | [twitter](https://twitter.com/bgok) | [linkedin](https://www.linkedin.com/in/kenhodler/)

Proof-of-work is an Ethereum smart contract verifies the work done by the proof-of-work web worker. In general, this code enables contracts to accept provable entropy from a user. The work is done over the hash of a recent block, the previous hash, and the address of the claimant. This ensures that the work is:

- recent (within the last 256 blocks or ~ 1 hour)
- for the right work chain
- doesn't use a previous nonce
- usable by only one claimant (prevents front running)

This contract supports multiple work chains that are identified by the address of the calling contract. This ensures that work done for one work chain can't be used for another.

Use cases:
- Select the winner of a lottery
- DNA for a generative art NFT
- Enforce a cadence for giveaways
- Provide entropy for puzzles and games

[Solidity Docs](https://genft-studio.github.io/proof-of-work/#/contracts/ProofOfWork.sol:ProofOfWork)

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The code hasn't been audited or reviewed by a cryptography export and is only minimally tested. Use it at your own risk. 

## TODO
- [X] Basic unit tests for the smart contract
- [ ] Add unit tests for cases that require work to be performed
- [ ] Fix tests of Events (YUNO work?)
- [ ] React component and sample app for the web worker
- [ ] Unit tests for the webworker and react components
- [ ] Automated difficulty adjustment
- [ ] Support multiple work chains for a contract