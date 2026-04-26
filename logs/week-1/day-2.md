# Day 2: The Art of the Transfer 

**Date:** April 24, 2026  
**Phase:** 1 (Setup & Fundamentals)  
**Objective:** Mastering transaction construction using the Lumos SDK

##  Proof of Work: Successful Transfer

Successfully executed a transfer of **99 CKB** using a custom dApp interface running on the local devnet.

###  Transfer Interface
The dApp successfully connected to the local node, identified the available capacity (42M CKB), and constructed the transaction.

![CKB Transfer UI](file:///home/badman/Projects/ckbuilders-log/logs/week-1/screenshots/day-2-transfer-ui.png)

###  Terminal Confirmation
The transaction was broadcast via the `simple-transfer` boilerplate, confirmed with hash:  
`0x6ad1ca2eb65347e494692e95d89cbbd3d5a448df073faae90b879b653924a11d`

![CKB Terminal Output](file:///home/badman/Projects/ckbuilders-log/logs/week-1/screenshots/day-2-terminal.png)

---

##  Reflection for Day 2
Constructing transactions manually feels more like "hardware programming" than "web development." You have to be mindful of every byte and every Shannon. For an AI agent, this level of control is a superpower—it can optimize its own "storage footprint" by merging or splitting cells dynamically.

**Next Step:** Exploring **Scripts** — moving from simple transfers to conditional logic (Lock Scripts).
