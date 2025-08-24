import {body, param} from "express-validator";

//array of body validators/sanitation -> applied when invoking validation result
function userRegistrationValidationRules(){
    return[
        body("firstname").isLength({min : 3}).withMessage("firstname must be a minimum of 3 characters"),
        body("lastname").isLength({min : 3}).withMessage("lastname must be a minimum of 3 characters"),
        body("email").isEmail().withMessage("email must be valid"),
        body("password").isStrongPassword({
            minLength:6,
            minLowercase:1,
            minUppercase:1,
            minSymbols:1,
            minNumbers:1,
        }).withMessage("password must be min 6 characters long, 1 uppercase, 1 lowercase, 1 special char, 1 number"),
        body("confirmpassword").custom((value, {req})=>{ 
            if(value !== req.body.password){
                throw new Error("password and confirm password must match");
            }else{
                return true;
            }
        }),
        body("mobile").isMobilePhone().withMessage("phone number must be valid"),
        body("usertype").isIn(['individual', 'organisation']).withMessage("usertype is invald")
    ];
}

function taskDataValidation(){
    //validation middleware for fields return an array of error objects when invoked
       return [
            body("taskname")
               .isLength({min : 6, max : 40})
               .withMessage("TaskName must be a minimum of 6 to 30 characters"), 
               //ensure that custom validation middleware returns a boollean value. 'value' arg passed to anonymous function is "deadline" (specific field of that payload)
            body("deadline")
               .custom((value, {req})=>{
                    if(req.body.status=="true") return true;
                    //backdated, within 15 min, cannot exceed month
                    if(new Date(value)<new Date() || new Date(value).getTime() < new Date().getTime() + (15 * 60 * 1000) || new Date(value).getTime() > new Date().getTime() + (30 * 24 * 60 * 60 * 1000)) return false;
                    return true;
               })
               .withMessage("Deadline must be of valid format and cannot be backdated, within 15min from now, or exceed 1 month from now")
       ];
   //next(); -> since next can't be invoked, isDataValid function is invoked 
}

function passwordResetValidation(){
    return [
        body("password").isStrongPassword({
            minLength:6,
            minLowercase:1,
            minUppercase:1,
            minSymbols:1,
            minNumbers:1,
        }).withMessage("password must be min 6 characters long, 1 uppercase, 1 lowercase, 1 special char, 1 number"),
        body("confirmpassword").custom((value, {req})=>{ 
            if(value !== req.body.password){
                throw new Error("password and confirm password must match");
            }else{
                return true;
            }
        })
    ];
}


function teamMemberValidation(){
    return [
        body("firstname").isLength({min : 3}).withMessage("firstname must be a minimum of 3 characters"),
        body("email").isEmail().withMessage("email must be valid"),
        body("mobile").isMobilePhone().withMessage("phone number must be valid"),
    ]
}


function usertypeValidation(){
    return [
        body("usertype").isIn(['individual', 'organisation']).withMessage("usertype is invald"),
    ]
}

function taskIdValidation(){
    return [
        param('taskId').isMongoId().withMessage("the taskId must be mongo object ID"),
    ]
}

function taskstatusValidation(){
    return [
        body("taskstatus").isBoolean().withMessage("status must be boollean"),
    ]
}


function teamIdValidation(){
    return[
        param('teamId').isMongoId().withMessage("teamId must be mongo object ID"),
    ]
}

function memberIdValidation(){
    return[
        param('memberId').isMongoId().withMessage("memberId must be mongo object ID"),
    ]
}

function insertMembersValidation(){
    return [
        body("members")
        .custom((value, { req }) => {
            if (Array.isArray(value) && value.length) return true;
            return false;
        }).withMessage("task must be assigned to atleast one member!")
    ]
}


function teamNameValidation(){
    return [
        body("teamname").isLength({ min: 6, max: 20 }).withMessage("teamname must be a minimum of 6 to 20 characters"),
    ]
}

export { userRegistrationValidationRules, taskDataValidation, passwordResetValidation, teamMemberValidation,
        usertypeValidation, taskIdValidation, taskstatusValidation, teamIdValidation, memberIdValidation, 
        insertMembersValidation, teamNameValidation}