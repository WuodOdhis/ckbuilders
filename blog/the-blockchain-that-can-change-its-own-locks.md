# The Blockchain That Can Change Its Own Locks

*Every other blockchain hardcoded its security in place. CKB didn't. That turns out to matter more than anyone expected.*

---

Imagine you own a safe.

Inside the safe is everything: your savings, your documents, your family's financial future. The safe's lock is a combination dial, the old kind, with numbers you spin to match a sequence. It was the best technology available when the safe was made, and for decades, it has been more than enough.

Now imagine a locksmith shows up at your door. Not a thief. An honest locksmith. She tells you that there's a new class of lock-picking machine being developed in government laboratories. It can't crack your safe today. Maybe not in five years. But in ten to fifteen years, the math that makes your combination dial secure will be solvable in minutes.

You have two options.

The first: hope the machine never becomes widely available before you can move everything out.

The second: replace the lock on the safe, right now, with one that the new machine cannot pick.

The problem is that your safe was welded shut at the factory. The manufacturer never designed the lock to be replaceable. Swapping it out requires dismantling the entire safe, moving all the assets out, reconstructing it, and having every bank, insurance company, and storage facility in the world agree on the new design at the same time.

That is the situation Bitcoin and Ethereum are in.

And it is why the Quantum Purse wallet shipping on Nervos CKB right now is a bigger deal than the headline suggests.

---

## The Threat Is Real, and the Timeline Is Closer Than You Think

Before getting into how CKB handles this, it is worth taking the threat seriously.

The cryptography that secures your Bitcoin, your Ethereum, and most of the digital assets in the world is called Elliptic Curve Cryptography, or ECC. The specific variant used by most blockchains is called secp256k1. It was designed in the early 2000s, it is mathematically elegant, and it generates very compact signatures that are cheap to verify.

The reason it is secure is that deriving a private key from a public key requires solving a problem called the elliptic curve discrete logarithm. On a classical computer, even a very powerful one, this problem cannot be solved in any practical amount of time. The keyspace is so large and the math so hard that you would need more computation than the observable universe could provide.

Quantum computers solve problems differently. A quantum computer running an algorithm called Shor's Algorithm can, in theory, solve the elliptic curve discrete logarithm efficiently. Not in a week. Not overnight. But in a timeframe that depends on how many stable "qubits" the machine can sustain.

In 2023, the US National Institute of Standards and Technology finalized its first set of post-quantum cryptography standards. The subtext of a government standards body spending years on this is not subtle: the timeline is real enough to plan for.

The obvious question for anyone who holds digital assets is: *when the quantum threat is no longer theoretical, can any of these networks actually respond to it?*

For most of them, the honest answer is: not cleanly.

---

## Why Other Blockchains Are Stuck

To understand why upgrading cryptography is so painful for most blockchains, you have to understand where signature verification actually lives in their architecture.

On Bitcoin, the signature verification logic is written directly into the Bitcoin Core implementation. The rules that say "a valid transaction requires a secp256k1 signature that satisfies the hash of the public key in this output" are baked into the protocol, enforced by every node on the network, and changeable only through a consensus upgrade, what the Bitcoin community calls a soft fork or hard fork depending on scope.

On Ethereum, it is similar. The EVM has a precompile, a piece of native code built into the virtual machine itself, for secp256k1 signature recovery. Adding a new cryptographic primitive requires adding a new precompile. Adding a new precompile requires an EIP, community debate, client implementations, and coordinated activation across the entire network.

This is not a criticism. It is a consequence of a deliberate design choice: keep the base layer simple, secure, and predictable. The tradeoff is that the base layer is rigid.

To add quantum-resistant signatures to Ethereum, you would need to:
1. Agree on a post-quantum signature standard.
2. Write an EIP specifying how it integrates into the EVM.
3. Implement it across multiple Ethereum client teams.
4. Coordinate a network-wide upgrade activation.
5. Migrate existing assets, because your old address, the one controlled by your secp256k1 key, cannot be retroactively protected without moving funds to a new address under the new scheme.

None of that is impossible. But it requires the entire network to act together. The word the industry uses for this property is *crypto agility*: the ability to swap out cryptographic primitives as they age or as threats evolve. Ethereum and Bitcoin were not designed with crypto agility as a first-class concern.

CKB was.

---

## How CKB Gets Out of the Way

The insight that makes CKB different starts with a question: where does signature verification have to live?

On Ethereum, the answer is: in the virtual machine, as a precompile, because contracts need to call it cheaply.

CKB's answer is different: it doesn't live in the VM at all. It lives in a user-space program deployed to the blockchain as a cell.

This is the same architectural choice that makes CKB addresses compress entire smart contracts into a string of text, as covered in an earlier piece. The Lock Script, the program that decides whether a transaction is allowed to spend a given cell, is not a primitive baked into CKB-VM. It is a RISC-V binary deployed on-chain like any other piece of code.

What this means for cryptography: there is no privileged signature scheme on CKB. The standard `Secp256k1Blake160` lock that most CKB addresses use is not a native operation of CKB-VM. It is a program that someone wrote, compiled to RISC-V, and deployed to a well-known system cell. Every node runs it to validate transactions, but it runs in the same RISC-V sandbox that any other script runs in. It has no special status.

If you want to use a different signature scheme, you write a new program, deploy it to the chain, and create a lock blueprint that points to your new program. Your cells are now governed by a completely different cryptographic primitive, with zero protocol-level changes required.

That is not a workaround. It is the intended design.

---

## SPHINCS+ and What It Actually Means

The post-quantum signature scheme that CKB has deployed on mainnet is called SPHINCS+, now formally standardized as NIST FIPS 205.

Unlike secp256k1, which derives security from the hardness of an algebraic problem that Shor's Algorithm can attack, SPHINCS+ derives its security from the properties of hash functions. Hashing a value is a one-way operation: easy to compute in one direction, computationally infeasible to reverse. No known quantum algorithm, including Shor's, provides a meaningful speedup against hash-function-based security.

This is why hash-based signatures are the conservative, long-term safe choice. If you do not trust any algebraic hardness assumption to survive the quantum era, you can still trust a good hash function.

SPHINCS+ has a notable tradeoff: its signatures are much larger than secp256k1 signatures. A standard secp256k1 signature is 64 bytes. A SPHINCS+ signature is roughly 8,080 bytes, depending on parameter choices. That is over a hundred times larger. On Ethereum, this would mean dramatically higher gas costs for every transaction, since calldata costs are billed per byte. On CKB, the signature goes into the transaction's witness field, which is excluded from the cell capacity calculation. The larger signature does not increase the on-chain storage rent. It makes SPHINCS+ practical on CKB in a way that it would not be on most EVM chains.

The Quantum Purse wallet, audited by ScaleBit and live on mainnet today, handles this entirely transparently. From the user's side, it looks like a standard self-custodial wallet. Under the hood, your cells are locked by a SPHINCS+ Lock Script rather than the default secp256k1 one.

---

## The Part That Should Make You Think Twice

Here is where I want to be honest about what this means in practice, because the full picture is more nuanced than the headline "CKB has quantum resistance" suggests.

The SPHINCS+ lock is opt-in. The majority of CKB assets today still use the classical secp256k1 lock. Moving to quantum-resistant protection requires actively migrating your funds, spending those assets in a transaction that creates new cells with the SPHINCS+ lock. If a quantum computer became capable of breaking secp256k1 tomorrow, assets sitting in the old lock format would be at risk.

This is not unique to CKB. On every blockchain, the user migration problem is real. But CKB's architecture at least makes the migration path technically clean. There is no protocol upgrade required. The new lock already exists on-chain. If you want to use it, you use it.

The deeper point is not that CKB has solved the quantum problem. It is that CKB's architecture makes the problem *solvable at the application layer*, without needing to mobilize a global network of validators, miners, client teams, and governance processes.

That distinction, between a problem that requires collective action and a problem that a motivated individual can solve for themselves today, is the difference between a rigid system and an adaptable one.

---

## Why This Matters Beyond Quantum Computers

The quantum threat is the current headline, but crypto agility is a broader principle.

Cryptographic standards change for reasons other than quantum computers. Algorithms get broken by classical math advances. Implementation vulnerabilities are discovered. New hardware creates new attack surfaces. The history of cryptography is a history of standards being deprecated and replaced.

The blockchain that handles this best is not the one that picked the best algorithm in 2009. It is the one that can replace its algorithm in 2034 without requiring its entire user base to coordinate a migration at the protocol level.

What CKB has built, perhaps without fully intending it as a security strategy, is a system where each cell carries its own security rules, independent of the network's base-layer choices. The network enforces that lock scripts run correctly. It does not dictate which lock scripts are acceptable. Users decide.

This is the same reason JoyID can use WebAuthn biometrics for a lock script. The same reason a developer can deploy a multisig lock with custom threshold logic. The same reason an autonomous AI agent can hold cells under a lock that requires no human signature at all. The separation between "what the network enforces" and "which cryptography you use" is a load-bearing architectural decision, not an accident.

The safe was built with a replaceable lock from the beginning. The manufacturer assumed the lock technology would change, so they engineered around that assumption.

That is either very good foresight, or very good luck. Either way, right now, in a world where NIST is publishing post-quantum standards and government agencies are preparing migration timelines, it looks like wisdom.

---

## The Honest Assessment

Nothing in this piece should be read as "CKB has solved quantum computing." The quantum threat is probabilistic, not certain. The timeline for cryptographically relevant quantum computers remains genuinely unclear, and the researchers who are most credible on the topic tend to be the most cautious about making predictions.

What CKB has done is build a system where the response to that threat lives in user space rather than protocol space. Where "upgrade the cryptography" means deploying a new lock script rather than rallying a network of thousands of node operators around a consensus change.

That is a meaningfully different position to be in.

The Quantum Purse wallet is not a solution to a problem that has arrived. It is a test of whether the architecture can deliver on its promise, before the test becomes mandatory.

The answer, as of today on CKB mainnet, is yes.

---

*This is part of an ongoing series documenting progress through the CKBuilders program. Previous posts cover the Cell Model's ownership semantics, the External Builder architecture, and why CKB addresses are smart contracts in disguise. The next piece will look at the Fiber Network and what it actually means for CKB and Bitcoin to share a payment channel layer.*
