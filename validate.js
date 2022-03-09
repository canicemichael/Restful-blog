const Joi = require('joi');

module.exports = {
     blogValidation : data => {
        const schema = Joi.object({
            title: Joi.string().min(4).required(),
            image: Joi.string().dataUri().required(),
            body: Joi.string().required()
        }).unknown();
    
        return schema.validate(data);
    },
    
     bottleValidation : data => {
        const schema = Joi.object({
            title: Joi.string().min(4).required(),
            image: Joi.string().dataUri().required(),
            body: Joi.string().required()
        }).unknown();

        return schema.validate(data);
    }
}



// module.exports.blogValidation = blogValidation;
// module.exports.bottleValidation = bottleValidation;