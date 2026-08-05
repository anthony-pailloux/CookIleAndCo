export function getCaptcha(req, res) {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;

  req.session.captchaAnswer = a + b;

  res.json({ question: a + ' + ' + b + ' = ?' });
}