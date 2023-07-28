import bcrypt from "bcryptjs";
import userModel from "../../../../DB/model/User.model.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
import jwt from "jsonwebtoken";
import sendEmail from "../../../utils/email.js";
// =================Sign Up=========================
export const signup = async (req, res, next) => {
  const { userName, email, password, cPassword, phone, gender } = req.body;

  const check = await userModel.findOne({
    $or: [{ userName }, { email }, { phone }],
  });
  if (check) {
    return next(
      new Error("Email or username or phone already exist", {
        cause: StatusCodes.CONFLICT,
      })
    );
  }
  const hashPassword = bcrypt.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );
  const user = await userModel.create({
    userName,
    email,
    password: hashPassword,
    phone,
    gender,
  });
  //Generate token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.EMAIL_SIGNATURE,
    { expiresIn: 60 * 5 }
  );
  //req New Eamil token
  const reqNewEamiltoken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.EMAIL_SIGNATURE
  );
  //link
  var link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
  //req New Eamil link
  const reqNewEamilLink = `${req.protocol}://${req.headers.host}/auth/newConfirmEmail/${reqNewEamiltoken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <style type="text/css">
        body {
            background-color: #fff;
            margin: 0px;
        }
    </style>
    
    <body style="margin:0px;">
        <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #bb4120;">
            <tr>
                <td>
                    <table border="0" width="100%">
                        <tr>
                            <td>
                                <h1>
                                </h1>
                            </td>
                            <td>
                                <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank"
                                        style="text-decoration: none;">View In Website</a></p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table border="0" cellpadding="0" cellspacing="0"
                        style="text-align:center;width:100%;background-color: #fff;">
                        
                        <tr>
                            <td>
                                <h1 style="padding-block:30px; color:#bb4120; background-color: #d9cecb;">Email Confirmation</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0px; ">
                                <p>Use the following button to confirm your email</p>
                                </td>
                        </tr>
                        <tr>
                            <td style="padding: 30px 0px; ">
                                <a href="${link}" style="margin:0px 0px 0px 0px;border-radius:4px;padding:10px 20px;text-decoration: none; border: 0;color:#fff;background-color:#bb4120; ">Verify Email address</a>
                                </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0px; ">
                                <p>If you have trouble using the button above, please click the following button</p>
                                </td>
                        </tr>
                        <tr>
                            <td style="padding: 30px 0px; ">
                                <a href="${reqNewEamilLink}" style="margin:0px 0px 0px 0px;border-radius:4px;padding:10px 20px;text-decoration: none; border: 0;color:#fff;background-color:#bb4120; ">New Verify Email address</a>
                                </td>
                        </tr>
                         
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                        <tr>
                            <td>
                                <h3 style="margin-top:30px; color:#000">Stay in touch</h3>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="margin-top:0px;">
                                    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit"
                                            style="padding:10px 9px;color:#fff;border-radius:50%;">
                                            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png"
                                                width="50px" hight="50px"></span></a>
                                    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit"
                                            style="padding:10px 9px;color:#fff;border-radius:50%;">
                                            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png"
                                                width="50px" hight="50px"></span>
                                    </a>
                                    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit"
                                            style="padding:10px 9px;;color:#fff;border-radius:50%;">
                                            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png"
                                                width="50px" hight="50px"></span>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
  //send email
  await sendEmail({ to: email, subject: "confirm Email", html });
  return res.status(StatusCodes.CREATED).json({
    message: "Done",
    user,
    status: getReasonPhrase(StatusCodes.CREATED),
  });
};
// =================confirm Email=========================
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.EMAIL_SIGNATURE);
  const user = await userModel.findByIdAndUpdate(decoded.id, {
    confirmEmail: true,
  });
  return user
    ? //Go to login page
      res.send("<a>Go to login page</a>")
    : //Go to signup page
      res.send("<a>Ops u look like do not have account</a>");
};
// =================New confirm Email=========================
export const newConfirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.EMAIL_SIGNATURE);
  const user = await userModel.findById(decoded.id);
  if (!user) {
    return res.send("<a>Ops u look like do not have account</a>");
  }
  if (user.confirmEmail) {
    return res.send("<a>Go to login page</a>");
  }
  const newtoken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.EMAIL_SIGNATURE,
    { expiresIn: 60 * 3 }
  );
  //link
  var link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newtoken}`;
  const html = `
  <!DOCTYPE html>
  <html>
  
  <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
  </head>
  <style type="text/css">
      body {
          background-color: #fff;
          margin: 0px;
      }
  </style>
  
  <body style="margin:0px;">
      <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #bb4120;">
          <tr>
              <td>
                  <table border="0" width="100%">
                      <tr>
                          <td>
                              <h1>
                              </h1>
                          </td>
                          <td>
                              <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank"
                                      style="text-decoration: none;">View In Website</a></p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
          <tr>
              <td>
                  <table border="0" cellpadding="0" cellspacing="0"
                      style="text-align:center;width:100%;background-color: #fff;">
                      
                      <tr>
                          <td>
                              <h1 style="padding-block:30px; color:#bb4120; background-color: #d9cecb;">Email Confirmation</h1>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 0px; ">
                              <p>Use the following button to confirm your email</p>
                              </td>
                      </tr>
                      <tr>
                          <td style="padding: 30px 0px; ">
                              <a href="${link}" style="margin:0px 0px 0px 0px;border-radius:4px;padding:10px 20px;text-decoration: none; border: 0;color:#fff;background-color:#bb4120; ">Verify Email address</a>
                              </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 0px; ">
                              <p>If you have trouble using the button above, please click the following button</p>
                              </td>
                      </tr>
                  </table>
              </td>
          </tr>
          <tr>
              <td>
                  <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                      <tr>
                          <td>
                              <h3 style="margin-top:30px; color:#000">Stay in touch</h3>
                          </td>
                      </tr>
                    
                  </table>
              </td>
          </tr>
      </table>
  </body>
  
  </html>`;
  //send email
  await sendEmail({ to: user.email, subject: "confirm Email", html });
  return res.send(`<p>Check your inbox now</p>`);
};
// =================Login=========================
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  // Find user by email
  const user = await userModel.findOne({ email }); 
  //check if user is email confirmed true?
  if (user.confirmEmail) {
    if (!user) {
      return next(new Error("In-valid Email or password", { cause: 404 }));
    }
    // password matched ?
    const match = bcrypt.compareSync(password, user.password);

    if (!match) {
      return next(new Error("In-valid Email or password", { cause: 400 }));
    }
    // user login
    const userLoggin = await userModel.updateOne(
      { _id: user._id },
      { isLoggedIn: true, isOnline: true, isDeleted: false },
      { new: true }
    );
    if (!userLoggin) {
      return next(new Error("In-valid user id", { cause: 400 }));
    } else {
      // generate token
      const token = jwt.sign(
        { name: user.userName, id: user._id, isLoggedIn: true },
        process.env.TOKEN_SIGNATURE,
        { expiresIn: "60d"  }
      );

      return res.status(StatusCodes.OK).json({ message: "Done", token });
    }
  } else {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Please cofirm your email" });
  }
};
//==============forget password======================
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email }); //{} null
  if (!user) {
    return next(new Error("In-valid Email or password", { cause: 404 }));
  } else {
    if (!user.confirmEmail) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Please cofirm your email" });
      } else {
        // generate token
        const token = jwt.sign(
          { name: user.userName, id: user._id },
          process.env.PASS_SIGNATURE,
          { expiresIn: 60 * 60 }
        );
        //link
        var link = `${req.protocol}://${req.headers.host}/auth/newPassword/${token}`;
        //send email
        await sendEmail({ to: email, subject: "Change password", html : `<a href="${link}">Click here to change password</a>` });
        return res.status(StatusCodes.OK).json({
          message: "Email sent",
          // user,
          status: getReasonPhrase(StatusCodes.OK),
        });
      }
    }
  }
//=============New password==========================
export const newPassword = async (req, res, next) => {
  const { newPassword, cPassword } = req.body;
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.PASS_SIGNATURE);

    if (!decoded?.id) {
      return next(new Error("In-valid Payload", { cause: 400 }))
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new Error("Not register account", { cause: 401 }))
    }
    const hashPassword = bcrypt.hashSync(
      newPassword,
      Number(process.env.SALT_ROUND)
    );
    const userUpdate = await userModel.updateOne(
      { _id: user._id },
      { password : hashPassword},
      { new: true }
    );

    if (!userUpdate) {
      return next(new Error("In-valid user id", { cause: 400 }));
    } else {
      return res.status(StatusCodes.OK).json({ message: "done", userUpdate });
    }
  }