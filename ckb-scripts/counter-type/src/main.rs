#![cfg_attr(target_arch = "riscv64", no_std)]
#![cfg_attr(not(test), no_main)]

#[cfg(test)]
extern crate alloc;

#[cfg(test)]
mod tests;

#[cfg(not(test))]
ckb_std::entry!(program_entry);

#[cfg(not(test))]
ckb_std::default_alloc!(16384, 1258306, 64);

use ckb_std::{
    ckb_constants::Source,
    high_level::load_cell_data,
};

pub fn program_entry() -> i8 {
    let input_data = match load_cell_data(0, Source::GroupInput) {
        Ok(data) => data,
        Err(_) => return -1,
    };

    let output_data = match load_cell_data(0, Source::GroupOutput) {
        Ok(data) => data,
        Err(_) => return -2,
    };
    
    if load_cell_data(1, Source::GroupInput).is_ok() {
        return -7;
    }

    if load_cell_data(1, Source::GroupOutput).is_ok() {
        return -8;
    }
    

    if input_data.len() != 8 {
        return -3;
    }

    if output_data.len() != 8 {
        return -4;
    }
    
    let mut input_bytes = [0u8; 8];
    input_bytes.copy_from_slice(&input_data);
    let input_value = u64::from_le_bytes(input_bytes);
    
    let mut output_bytes = [0u8; 8];
    output_bytes.copy_from_slice(&output_data);
    let output_value = u64::from_le_bytes(output_bytes);
    
    let expected_output = match input_value.checked_add(1) {
        Some(value) => value,
        None => return -5,
    };
    
    if output_value != expected_output {
        return -6;
    }

    
   0 
}