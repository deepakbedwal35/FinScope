const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            console.error("Validation failed:", error.message);
            return res.status(400).json({
                errors: error.details.map(err => err.message)
            });
        }

        req.body = value;
        next();
    };
};

module.exports = validate;
