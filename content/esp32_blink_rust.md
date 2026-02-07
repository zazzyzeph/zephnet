---
title: "ESP32 Rust First Step"
type: "entry"
date: 2026-02-07T15:50:05-05:00
featured_image: "https://media.zephnet.biz/esp32_led_blink.jpg"
featured_video: "https://media.zephnet.biz/esp32_led_blink.mp4"
featured_image_alt: "a small led shines a blue light. it is connected to a clear breadboard, and to a small black microcontroller. a piece of paper nearby lists the specs of the microcontroller"
tags: ["esp32", "hardware", "rust", "event"]
---

Been a while since I made anything hardware-related, and I've wanted to learn Rust specifically for microcontrollers, so here's my first step towards becoming a Rustacean - an led blinking from an esp32-c3 supermini I picked up at [iffy books](https://iffybooks.net) 😄

I mostly followed Espressif's [documentation for programming ESP boards using Rust](https://docs.espressif.com/projects/rust/book/preface.html), and adapting the 'hello world' example that comes from their `esp-generate` crate so it uses the GPIO bits from [this example for turning on an LED](https://github.com/esp-rs/esp-hal/blob/esp-hal-v1.0.0/examples/interrupt/gpio/src/main.rs) from the BOOT button on the board.

Excited for the next [PHL Code Club](https://phlcode.club) talk by [Ben Corey](https://benjamincorey.ney) on Rust! Event details on Luma: [Rust for the Rest of Us](https://luma.com/adtkn9n8)

My current goal is to get an eink display connected to this thing and have it show the current temp and chance of precipitation today.

Here's my `main.rs` for this simple blink sketch, and it shouldn't be taken seriously :^)

Some comments are my own, some are from `esp-generate`

```rust
#![no_std] // no rust std library
#![no_main] // custom main function
#![deny(
    clippy::mem_forget,
    reason = "mem::forget is generally not safe to do with esp_hal types, especially those \
    holding buffers for the duration of a data transfer."
)]
#![deny(clippy::large_stack_frames)] // avoids problems with large stack frames

// initialization for our libraries
use core::cell::RefCell;
use critical_section::Mutex;
use esp_hal::clock::CpuClock;
use esp_hal::main;
use esp_hal::time::{Duration, Instant};
use esp_hal::timer::timg::TimerGroup;
use esp_hal::handler;
use esp_hal::ram;
use esp_hal::gpio::{Event, Input, InputConfig, Io, Level, Output, OutputConfig, Pull};
use esp_radio::ble::controller::BleConnector;
use log::info;

// no_std environment means we need a custom panic handler
#[panic_handler]
fn panic(_: &core::panic::PanicInfo) -> ! {
    loop {}
}

extern crate alloc;

// This creates a default app-descriptor required by the esp-idf bootloader.
// For more information see: <https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/system/app_image_format.html#application-description>
esp_bootloader_esp_idf::esp_app_desc!();

#[allow(
    clippy::large_stack_frames,
    reason = "it's not unusual to allocate larger buffers etc. in main"
)]
#[main]
fn main() -> ! {
    // generator version: 1.2.0

    esp_println::logger::init_logger_from_env();

    let config = esp_hal::Config::default().with_cpu_clock(CpuClock::max());
    let peripherals = esp_hal::init(config);

    // Set GPIO2 as an output
    let mut io = Io::new(peripherals.IO_MUX);

    let mut led = Output::new(peripherals.GPIO2, Level::Low, OutputConfig::default());

    esp_alloc::heap_allocator!(#[esp_hal::ram(reclaimed)] size: 66320);
    // COEX needs more RAM - so we've added some more
    esp_alloc::heap_allocator!(size: 64 * 1024);

    let led_config = InputConfig::default().with_pull(Pull::Up);

    let timg0 = TimerGroup::new(peripherals.TIMG0);
    let sw_interrupt =
        esp_hal::interrupt::software::SoftwareInterruptControl::new(peripherals.SW_INTERRUPT);
    esp_rtos::start(timg0.timer0, sw_interrupt.software_interrupt0);

    led.set_high();
    loop {
        // info!("Hello world!");
        led.toggle();
        let delay_start = Instant::now();
        while delay_start.elapsed() < Duration::from_millis(500) {}
    }

    // for inspiration have a look at the examples at https://github.com/esp-rs/esp-hal/tree/esp-hal-v1.0.0/examples
}
```

and my `cargo.toml` which certainly has more packages than I need for this as I enabled bluetooth and wifi :^)

```toml
[package]
edition      = "2024"
name         = "supermini_blink"
rust-version = "1.88"
version      = "0.1.0"

[[bin]]
name = "supermini_eink"
path = "./src/bin/main.rs"

[dependencies]
esp-hal = { version = "~1.0", features = ["esp32c3", "log-04", "unstable"] }

esp-rtos = { version = "0.2.0", features = [
  "esp-alloc",
  "esp-radio",
  "esp32c3",
  "log-04",
] }

esp-bootloader-esp-idf = { version = "0.4.0", features = ["esp32c3", "log-04"] }
log                    = "0.4.27"

bleps = { git = "https://github.com/bjoernQ/bleps", package = "bleps", rev = "a5148d8ae679e021b78f53fd33afb8bb35d0b62e", features = [
  "async",
  "macros",
] }
critical-section = "1.2.0"
embedded-io = "0.7.1"
esp-alloc = "0.9.0"
esp-println = { version = "0.16.1", features = ["esp32c3", "log-04"] }
esp-radio = { version = "0.17.0", features = [
  "ble",
  "coex",
  "esp-alloc",
  "esp32c3",
  "log-04",
  "smoltcp",
  "unstable",
  "wifi",
] }
smoltcp = { version = "0.12.0", default-features = false, features = [
  "log",
  "medium-ethernet",
  "multicast",
  "proto-dhcpv4",
  "proto-dns",
  "proto-ipv4",
  "socket-dns",
  "socket-icmp",
  "socket-raw",
  "socket-tcp",
  "socket-udp",
] }
cfg-if = "1.0.4"


[profile.dev]
# Rust debug is too slow.
# For debug builds always builds with some optimization
opt-level = "s"

[profile.release]
codegen-units    = 1     # LLVM can perform better optimizations using a single thread
debug            = 2
debug-assertions = false
incremental      = false
lto              = 'fat'
opt-level        = 's'
overflow-checks  = false
```
