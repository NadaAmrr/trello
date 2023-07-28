export const validation = (JoiSchema) => {
  return (req, res, next) => {

    const allDataFromAllMethods = {...req.body , ...req.params , ...req.query}
    console.log(allDataFromAllMethods);
    const validationResult = JoiSchema.validate(allDataFromAllMethods, { abortEarly: false });
    if (validationResult.error) {
      return res.json({
        message: "Validation Error",
        ERR: validationResult.error.details,
      });
    }
    return next()
  };
};
