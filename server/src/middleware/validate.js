export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      error.isJoi = true;
      return next(error);
    }
    if (source === 'query') req.validatedQuery = value;
    else if (source === 'params') Object.assign(req.params, value);
    else req.body = value;
    next();
  };
}
