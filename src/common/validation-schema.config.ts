import Joi from "joi";

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
        otherwise: Joi.string().optional().allow(""),
    }),
    BUCKET: Joi.string().required(),
    KEY_FILENAME: Joi.string().required(),
    GLITCHTIP_DSN: Joi.string().optional(),
    WOMPI_PUBLIC_KEY: Joi.string().when("APP_ENV", {
        is: Joi.valid("production", "testing"),
        then: Joi.string().min(1).required(),
        otherwise: Joi.string().optional().allow(""),
    }),
    WOMPI_BASE_URL: Joi.string().when("APP_ENV", {
        is: Joi.valid("production", "testing"),
        then: Joi.string().min(1).required(),
        otherwise: Joi.string().optional().allow(""),
    }),
    WOMPI_INTEGRITY_SECRET: Joi.string().when("APP_ENV", {
        is: Joi.valid("production", "testing"),
        then: Joi.string().min(1).required(),
        otherwise: Joi.string().optional().allow(""),
    }),
    WOMPI_PRIVATE_KEY: Joi.string().when("APP_ENV", {
        is: Joi.valid("production", "testing"),
        then: Joi.string().min(1).required(),
        otherwise: Joi.string().optional().allow(""),
    }),
    WOMPI_SECRET_EVENT: Joi.string().when("APP_ENV", {
        is: Joi.valid("production", "testing"),
        then: Joi.string().min(1).required(),
        otherwise: Joi.string().optional().allow(""),
    }),
});
