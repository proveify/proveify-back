import * as Joi from "joi";

export default Joi.object({
    APP_ENV: Joi.string().valid("development", "production", "testing").default("development"),
    APP_PORT: Joi.number().default(3001),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().required(),
    REFRESH_JWT_SECRET: Joi.string().required(),
    REFRESH_JWT_EXPIRES_IN: Joi.string().required(),
    CORS_URL_LIST: Joi.string().when("APP_ENV", {
        is: "production",
        then: Joi.string().required(),
        otherwise: Joi.string(),
    }),
    BUCKET: Joi.string().required(),
    KEY_FILENAME: Joi.string().required(),
});
