//validation
const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

function personValidation(data){

    const personData = {
        nome: data.nome,
        email: data.email,
        admin: data.admin,
    }

    const schema = Joi.object({
        nome: Joi.string().min(2).required(),
        email: Joi.string().min(6).required().email(),
        admin: Joi.boolean(),
    })
    return schema.validate(personData)
}

function studentValidation(data){

    const studentData = {
        paid: data.paid,
        hours: data.hours,
        institution: data.institution,
        course: data.course,
        cpf: data.cpf
    }

    const schema = Joi.object({
        cpf: Joi.string().min(11).max(14).required(),
        paid: Joi.boolean(),
        hours: Joi.number(),
        institution: Joi.string(),
        course: Joi.string()
    })
    return schema.validate(studentData)
}

module.exports.personValidation = personValidation
module.exports.studentValidation = studentValidation