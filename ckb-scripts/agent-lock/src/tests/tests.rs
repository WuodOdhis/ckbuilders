use super::Loader;
use ckb_testtool::ckb_types::{
    bytes::Bytes,
    core::TransactionBuilder,
    packed::*,
    prelude::*,
};
use ckb_testtool::context::Context;

const MAX_CYCLES: u64 = 50_000_000;

fn setup_contract_with_args(args: Bytes) -> (Context, Script) {
    let mut context = Context::default();
    let contract_bin: Bytes = Loader::default().load_binary("agent-lock");
    let out_point = context.deploy_cell(contract_bin);
    let lock_script = context
        .build_script(&out_point, args)
        .expect("script");
    (context, lock_script)
}

fn build_single_input_output_tx(
    context: &mut Context,
    lock_script: Script,
) -> TransactionView {
    let input_out_point = context.create_cell(
        CellOutput::new_builder()
            .capacity(1000)
            .lock(lock_script.clone())
            .build(),
        Bytes::new(),
    );

    let input = CellInput::new_builder()
        .previous_output(input_out_point)
        .build();

    let outputs = vec![
        CellOutput::new_builder()
            .capacity(500)
            .lock(lock_script)
            .build(),
    ];

    let outputs_data = vec![Bytes::new()];

    let tx = TransactionBuilder::default()
        .input(input)
        .outputs(outputs)
        .outputs_data(outputs_data.pack())
        .build();
    context.complete_tx(tx)
}

#[test]
fn test_contract_rejects_missing_witness() {
    let (mut context, lock_script) = setup_contract_with_args(Bytes::from(vec![0u8; 20]));
    let tx = build_single_input_output_tx(&mut context, lock_script);
    let result = context.verify_tx(&tx, MAX_CYCLES);
    assert!(result.is_err(), "Expected failure: no valid signature witness provided");
}

#[test]
fn test_contract_rejects_wrong_length_args() {
    let (mut context, lock_script) = setup_contract_with_args(Bytes::from(vec![0u8; 10]));
    let tx = build_single_input_output_tx(&mut context, lock_script);
    let result = context.verify_tx(&tx, MAX_CYCLES);
    assert!(result.is_err(), "Expected failure: args must be exactly 20 bytes");
}

#[test]
fn test_contract_rejects_zero_length_args() {
    let (mut context, lock_script) = setup_contract_with_args(Bytes::new());
    let tx = build_single_input_output_tx(&mut context, lock_script);
    let result = context.verify_tx(&tx, MAX_CYCLES);
    assert!(result.is_err(), "Expected failure: empty args should be rejected");
}

#[test]
fn test_contract_rejects_wrong_length_args_oversized() {
    let (mut context, lock_script) = setup_contract_with_args(Bytes::from(vec![0u8; 32]));
    let tx = build_single_input_output_tx(&mut context, lock_script);
    let result = context.verify_tx(&tx, MAX_CYCLES);
    assert!(result.is_err(), "Expected failure: args must be exactly 20 bytes, not 32");
}

#[test]
fn test_contract_deployment_and_basic_execution() {
    let (mut context, lock_script) = setup_contract_with_args(Bytes::from(vec![0u8; 20]));
    let tx = build_single_input_output_tx(&mut context, lock_script);

    let result = context.verify_tx(&tx, MAX_CYCLES);
    assert!(result.is_err(), "Script should fail without valid ECDSA signature in witness");

    match result {
        Err(e) => {
            let err_str = format!("{:?}", e);
            assert!(
                err_str.contains("error code") || err_str.contains("ValidationFailure"),
                "Expected a validation error, got: {err_str}"
            );
        }
        _ => {}
    }
}
