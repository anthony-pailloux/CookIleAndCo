export default function verifyCaptcha(req, res, next) {
  const expected = req.session.captchaAnswer;
  const given = Number(req.body.captchaAnswer);

  if (expected === undefined || expected === null) {
    res.status(400).json({ error: 'Captcha expiré, rechargez la page' });
  } else if (given !== expected) {
    res.status(400).json({ error: 'Réponse captcha incorrecte' });
  } else {
    delete req.session.captchaAnswer;
    next();
  }
}