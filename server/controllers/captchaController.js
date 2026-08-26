// Cree une petite addition aleatoire pour verifier que ce n est pas un robot.
export function getCaptcha(req, res) {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;

  req.session.captchaAnswer = a + b;

  res.json({ question: a + ' + ' + b + ' = ?' });
}