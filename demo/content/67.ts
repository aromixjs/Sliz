export default {
  name: "67 - control characters",
  expected: "stress",
  source: "<div>\0\t\r\nhello\u0001\u0002\u0003world</div>",
};
