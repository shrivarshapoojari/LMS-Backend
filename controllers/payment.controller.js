import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/appError.js";

export const getRazorpayApiKey = async (req, res, next) => {

try{
    res.status(200).json({
        success:true,
        message:"RaorPay Key",
        key:process.env.RAZORPAY_API_KEY
    })

}
catch(e)
{
    return next(new AppError(e.message,500))
}







};

export const buySubscription = async (req, res, next) => {

    try{
        const {id}=req.user;
        const user=await User.findById(id);

        if(!user)
        {
            return next(new AppError("User Not found",404))
        }
         
        if(user.role=='ADMIN')
        {
            return next (new AppError("Admin cant buy subscription",400))
        }

        const subscription=await razorpay.subscriptions.create({
            plan_id:process.env.RAZORPAY_PLAN,
            customer_notify:1 // sends mail to customer
        })

        // update userr with subscription
       if(subscription)
       {
        user.subscription.id=subscription.id;
        user.subscription.status=subscription.status
       }
           await user.save();
           res.status(200).json({
            success:true,
            message:" Subscribed Successfully"
           })
    }
    catch(e)
    {
        return next(new AppError(e.message,500))
    }
    











};

export const verifySubscription = async (req, res, next) => {

    try{
           const {id}=req.user;
           const user = await User.findById(id);
           if(!user)
           {
               return next(new AppError("User Not found",404))
           }

           const {razorpay_payment_id,razorpay_signature,razorpay_subscription_id}=req.body;
           
           const generatedSignature =crypto
                                        .createHmac('sha256',process.env.RAZORPAY_SECRET)
                                        .update(`${razorpay_payment_id} | ${razorpay_subscription_id}`)


                                        if(generatedSignature!==razorpay_signature)
                                        {
                                            return next(new AppError("Payment Unsuccessfull",500))
                                        }
  // Record Payment Details in Database
    await Payment.create({
        payment_id:razorpay_payment_id,
        subscription_id:razorpay_subscription_id,
        signature:razorpay_signature
        
    })
  // update user model with successful payment
  user.subscription.status='active';
  await user.save();


  res.status(200).json({
    success:true,
    message:"Payment Verified"
  })



    

    } 
    catch(e)
    {
        return next(new AppError(e.message,500))
    }
    
};

export const cancelSubscription = async (req, res, next) => {
    try{
        const {id}=req.user;
        const user = await User.findById(id);
        if(!user)
        {
            return next(new AppError("User Not found",404))
        }

        if(user.role==='ADMIN')
    {
        return next(new AppError("Admin cant cancel subscription",500))
    }

    const subscriptionId=user.subscription.id;
      const subscription= await razorpay.subscriptions.cancel({
        subscriptionId
      });
      user.subscription.status=subscription.status;
      await user.save();
      res.status(200).json({
        success:true,
        message:"Subscription cancelled"
      })
    }
    catch(e)
    {
        return next(new AppError(e.message,500))
    }
    
    
};

export const getAllPayments = async (req, res, next) => {
    try{
        const {count}=req.query;
        const subscriptions=razorpay.subscriptions.all({
            count: count ||10,
        });

        res.status(200).json({
            success:true,
            message:'All Payments',
            payments:subscriptions
        })

    }
    catch(e)
    {
        return next(new AppError(e.message,500))
    }
    
};
