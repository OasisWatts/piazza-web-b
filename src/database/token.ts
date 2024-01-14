import jwt from "jsonwebtoken"

exports.verifyToken = (req, res, next) => {
    // 인증 완료
    try {
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
        console.log("req decoded", req.headers.authorization, req.decoded)
        return next();
    }

    // 인증 실패 
    catch (error) {
        if (error.name === "TokenExpireError") {
            return res.status(419).json({
                code: 401,
                message: "expired"
            });
        }
        return res.status(401).json({
            code: 401,
            message: error.name
        });
    }
}