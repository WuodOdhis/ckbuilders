# Week 5 Day 1: Type Scripts & Counter State

Today I moved from custom lock scripts into type scripts.

The key distinction became much clearer after comparing this week with the Agent Lock project. The Agent Lock was mainly about authorization. Its lock script answered one question: is this transaction allowed to spend the cell? It recovered a public key from a witness signature and checked whether that key matched the trusted agent hash in the script args.

Type scripts answer a different question. They are not mainly about who can spend a cell. They are about whether the proposed state transition is valid.

```txt
Lock script: Who is allowed to spend this cell?
Type script: Is this state transition valid?
```

The big mental shift is that CKB cells are immutable. A transaction does not edit a cell in place. It consumes old cells as inputs and creates new cells as outputs. If a cell represents some state, updating that state means destroying the old version and creating a new version. The type script verifies that the transformation follows the rules.

To make that concrete, I started a minimal `counter-type` script. The rule is simple: one input counter cell must become one output counter cell, and the output value must be exactly the input value plus one.

```txt
input cell data:  3
output cell data: 4
```

That should pass.

```txt
input cell data:  3
output cell data: 99
```

That should fail, even if the owner is authorized by the lock script.

The script uses `load_cell_data` with `Source::GroupInput` and `Source::GroupOutput`, which was an important concept. Instead of scanning the entire transaction, the script reads the cells that share the same type script. That is the script group the VM is currently validating.

The first version of the counter script validates:

- there is one counter input cell
- there is one counter output cell
- both data blobs are exactly 8 bytes
- both values decode as little-endian `u64`
- the output value equals the input value plus one
- overflow is rejected using `checked_add`

This was the first time I wrote a script that really treats a CKB cell as state, not just as something protected by an authorization rule.

## Screenshots
- [Counter Type Toolchain Setup](./screenshots/counter-type-toolchain.png)
