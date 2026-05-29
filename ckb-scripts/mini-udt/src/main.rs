#![cfg_attr(target_arch = "riscv64", no_std)]
#![cfg_attr(not(test), no_main)]

#[cfg(test)]
extern crate alloc;

#[cfg(test)]
mod tests;

#[cfg(not(test))]
ckb_std::entry!(program_entry);
#[cfg(not(test))]
// By default, the following heap configuration is used:
// * 16KB fixed heap
// * 1.2MB(rounded up to be 16-byte aligned) dynamic heap
// * Minimal memory block in dynamic heap is 64 bytes
// For more details, please refer to ckb-std's default_alloc macro
// and the buddy-alloc alloc implementation.
ckb_std::default_alloc!(16384, 1258306, 64);

use alloc::vec::Vec;
use ckb_std::{
    ckb_types::prelude::*,
    debug,
    high_level::{load_cell_data, load_script, load_cell_lock_hash, QueryIter},
    ckb_constants::Source,
};

pub fn program_entry() -> i8 {
    // 1. Get our script's args (this represents the Owner Lock Hash)
    let script = load_script().unwrap();
    let args: Vec<u8> = script.args().unpack();
    
    let mut input_sum: u128 = 0;
    let mut output_sum: u128 = 0;

    // 2. Sum up all the token balances in the input cells that have this exact type script
    for data in QueryIter::new(load_cell_data, Source::GroupInput) {
        if data.len() < 16 {
            debug!("Error: Input cell data too short for a u128 balance");
            return -1;
        }
        let mut buf = [0u8; 16];
        buf.copy_from_slice(&data[0..16]);
        input_sum += u128::from_le_bytes(buf);
    }

    // 3. Sum up all the token balances in the output cells that have this exact type script
    for data in QueryIter::new(load_cell_data, Source::GroupOutput) {
        if data.len() < 16 {
            debug!("Error: Output cell data too short for a u128 balance");
            return -2;
        }
        let mut buf = [0u8; 16];
        buf.copy_from_slice(&data[0..16]);
        output_sum += u128::from_le_bytes(buf);
    }

    debug!("Input sum: {}, Output sum: {}", input_sum, output_sum);

    // 4. Mathematical Validation
    if input_sum == output_sum {
        // Normal Transfer: No tokens were created or destroyed.
        debug!("Transfer valid!");
        return 0;
    } else if input_sum < output_sum {
        // Minting: New tokens are being created! 
        // Rule: At least one input cell must have a Lock Script Hash that matches our Type Script's args.
        if args.len() != 32 {
            debug!("Error: Args must contain the 32-byte Owner Lock Hash to mint");
            return -3;
        }
        
        let mut is_owner_present = false;
        for lock_hash in QueryIter::new(load_cell_lock_hash, Source::Input) {
            if lock_hash == args.as_slice() {
                is_owner_present = true;
                break;
            }
        }
        
        if is_owner_present {
            debug!("Minting valid: Owner is present in inputs!");
            return 0;
        } else {
            debug!("Error: Minting denied. Owner lock script not found in inputs!");
            return -4;
        }
    } else {
        // Burning: Tokens are being destroyed (input_sum > output_sum).
        // It's perfectly fine to let users throw their own tokens away!
        debug!("Burning valid: Tokens destroyed!");
        return 0;
    }
}
