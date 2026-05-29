use super::Loader;
use ckb_testtool::{builtin::ALWAYS_SUCCESS, context::Context};
use ckb_testtool::ckb_types::{
    bytes::Bytes,
    core::TransactionBuilder,
    packed::*,
    prelude::*,
};

fn token_amount(value: u128) -> Bytes {
    Bytes::from(value.to_le_bytes().to_vec())
}

#[test]
fn test_transfer_preserves_total_supply() {
    let mut context = Context::default();

    let udt_bin: Bytes = Loader::default().load_binary("mini-udt");
    let udt_out_point = context.deploy_cell(udt_bin);

    let lock_out_point = context.deploy_cell(ALWAYS_SUCCESS.clone());
    let lock_script = context
        .build_script(&lock_out_point, Bytes::new())
        .expect("lock script");

    let type_script = context
        .build_script(&udt_out_point, Bytes::from(vec![42]))
        .expect("type script");

    let input_out_point = context.create_cell(
        CellOutput::new_builder()
            .capacity(1000)
            .lock(lock_script.clone())
            .type_(Some(type_script.clone()).pack())
            .build(),
        token_amount(100),
    );

    let input = CellInput::new_builder()
        .previous_output(input_out_point)
        .build();

    let outputs = vec![
        CellOutput::new_builder()
            .capacity(500)
            .lock(lock_script.clone())
            .type_(Some(type_script.clone()).pack())
            .build(),
        CellOutput::new_builder()
            .capacity(500)
            .lock(lock_script)
            .type_(Some(type_script).pack())
            .build(),
    ];

    let outputs_data = vec![token_amount(40), token_amount(60)];

    let tx = TransactionBuilder::default()
        .input(input)
        .outputs(outputs)
        .outputs_data(outputs_data.pack())
        .build();
    let tx = context.complete_tx(tx);

    let cycles = context
        .verify_tx(&tx, 10_000_000)
        .expect("transfer should preserve total supply");
    println!("consume cycles: {cycles}");
}
