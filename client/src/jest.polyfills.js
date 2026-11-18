const { TextDecoder, TextEncoder } = require("util");
const {
  ReadableStream,
  WritableStream,
  TransformStream,
} = require("stream/web");

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
global.TransformStream = TransformStream;
global.setImmediate =
  global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
