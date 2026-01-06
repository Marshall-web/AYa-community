import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChefHat,
  Shield,
  CreditCard,
  Mail,
  User,
} from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import api from "@/lib/api";
import { PAYSTACK_PUBLIC_KEY } from "@/config/paystack";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface PaymentData {
  orderType: "delivery" | "booking";
  bookingType?: string; // "Pool Session", "Event", "Sports", "Radio Advertisement", etc.
  items: OrderItem[];
  total: number;
  customerName?: string; // Customer name for delivery orders
  deliveryAddress?: string;
  deliveryPhone?: string;
  deliveryInstructions?: string;
  bookingName?: string;
  bookingPhone?: string;
  bookingEmail?: string;
  bookingDate?: string;
  bookingTime?: string;
  bookingDetails?: string; // Additional booking information
  guests?: number;
  slots?: number; // Number of slots/swimmers for pool sessions
  specialRequests?: string;
  adRequestData?: {
    businessName: string;
    contactPerson: string;
    phone: string;
    email: string;
    slot: string;
    numberOfSpots: string;
    adScript: string;
  };
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    // Get payment data from location state
    const data = location.state as PaymentData;
    if (!data) {
      navigate("/");
      return;
    }
    
    // For bookings, items might be empty, so check for bookingType or orderType
    if ((!data.items || data.items.length === 0) && !data.bookingType && !data.orderType) {
      navigate("/");
      return;
    }
    
    setPaymentData(data);
    // Set email from user or booking data
    setEmail(data.bookingEmail || user?.email || "");
  }, [isAuthenticated, location, navigate, user]);

  // Check availability when payment data is loaded (for bookings only)
  useEffect(() => {
    const checkBookingAvailability = async () => {
      if (!paymentData || paymentData.orderType !== "booking" || paymentData.bookingType === "Radio Advertisement") {
        setIsAvailable(true); // For non-booking or radio ads, assume available
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const bookingType = paymentData.bookingType || "Booking";
        const bookingDateStr = paymentData.bookingDate || "";
        const requestedSlots = paymentData.slots || paymentData.guests || 1;
        
        // For Pool Sessions, include the time in the date string
        const fullDateStr = paymentData.bookingTime 
          ? `${bookingDateStr} at ${paymentData.bookingTime}`
          : bookingDateStr;

        const response = await api.post("/bookings/check_availability/", {
          booking_type: bookingType,
          date: fullDateStr,
          slots: requestedSlots,
        });

        setIsAvailable(response.data.available);
        setAvailabilityMessage(response.data.message || "");
        
        if (!response.data.available) {
          setErrorMessage(
            response.data.message || 
            "This slot is no longer available. Please go back and select a different time."
          );
        }
      } catch (error: any) {
        console.error("Availability check error:", error);
        setIsAvailable(false);
        setErrorMessage(
          error.response?.data?.detail || 
          error.message || 
          "Failed to verify availability. Please try again."
        );
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    if (paymentData) {
      checkBookingAvailability();
    }
  }, [paymentData]);

  // Initialize Paystack payment hook
  const initializePayment = usePaystackPayment({
    publicKey: PAYSTACK_PUBLIC_KEY,
    email: email || user?.email || "customer@example.com",
    amount: paymentData ? (paymentData.total * 100) : 0,
    currency: "GHS",
    metadata: {
      custom_fields: [
        {
          display_name: "Booking Type",
          variable_name: "booking_type",
          value: paymentData?.bookingType || paymentData?.orderType || "Unknown",
        },
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: paymentData?.bookingName || user?.first_name || user?.username || "",
        },
      ],
    },
  });

  const onSuccess = async (reference: any) => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // After successful payment, create the booking/order
      if (paymentData?.orderType === "delivery") {
        const orderItems = paymentData.items
          .map((item) => `${item.name} x${item.quantity}`)
          .join(", ");

        await api.post("/orders/", {
          customer_name: paymentData.customerName || user?.first_name || user?.username || paymentData.deliveryPhone || "Customer",
          items: `${orderItems} | Address: ${paymentData.deliveryAddress || ""} | Phone: ${paymentData.deliveryPhone} | Instructions: ${paymentData.deliveryInstructions || ""}`,
          total_price: paymentData.total,
          status: "Pending",
        });
      } else if (paymentData?.orderType === "booking") {
        // Check if this is a radio ad request
        if (paymentData.bookingType === "Radio Advertisement" && paymentData.adRequestData) {
          const slotData = paymentData.adRequestData;
          const slotInfo = `${slotData.slot} - ${slotData.numberOfSpots} spot(s)`;
          
          // Create ad request after successful payment - Admin needs to verify payment before approving
          await api.post("/ad-requests/", {
            business_name: slotData.businessName,
            slot: slotInfo,
            cost: paymentData.total,
            status: "Pending", // Admin needs to verify payment before approving
          });
        } else {
          // Double-check availability right before creating booking to prevent race conditions
          const bookingType = paymentData.bookingType || "Booking";
          const bookingDateStr = paymentData.bookingDate || "";
          const requestedSlots = paymentData.slots || paymentData.guests || 1;  // Get slots from payment data
          
          // For Pool Sessions, include the time in the date string
          const fullDateStr = paymentData.bookingTime 
            ? `${bookingDateStr} at ${paymentData.bookingTime}`
            : bookingDateStr;
          
          // Check availability one more time before creating booking
          try {
            const availabilityCheck = await api.post("/bookings/check_availability/", {
              booking_type: bookingType,
              date: fullDateStr,
              slots: requestedSlots,  // Include slots for pool sessions
            });

            if (!availabilityCheck.data.available) {
              throw new Error(
                availabilityCheck.data.message || 
                "This slot was just booked by another customer. Your payment will be refunded."
              );
            }
          } catch (error: any) {
            // If availability check fails, treat it as a conflict
            if (error.response?.status === 200 && !error.response?.data?.available) {
              throw new Error(
                error.response.data.message || 
                "This slot was just booked by another customer. Your payment will be refunded."
              );
            }
            // If it's a different error, re-throw it
            throw error;
          }

          // Create regular booking after successful payment - Admin needs to verify payment before approving
          const bookingDetails = paymentData.bookingDetails || 
            `${paymentData.bookingDate || ""}${paymentData.bookingTime ? ` at ${paymentData.bookingTime}` : ""}${paymentData.guests ? ` | Guests: ${paymentData.guests}` : ""}${paymentData.specialRequests ? ` | Requests: ${paymentData.specialRequests}` : ""}`;

          try {
            await api.post("/bookings/", {
              guest_name: paymentData.bookingName || "",
              booking_type: bookingType,
              date: bookingDetails,
              status: "Pending", // Admin needs to verify payment before approving
              slots: requestedSlots,  // Include slots for pool sessions
            });
          } catch (error: any) {
            // Handle booking conflict error from backend
            if (error.response?.status === 409 && error.response?.data?.error_code === "BOOKING_CONFLICT") {
              throw new Error(
                error.response.data.detail || 
                "This slot was just booked by another customer. Your payment will be refunded."
              );
            }
            throw error;
          }
        }
      }

      setPaymentStatus("success");
      
      // Redirect after 3 seconds
      setTimeout(() => {
        if (paymentData?.orderType === "delivery") {
          navigate("/restaurant");
        } else {
          // Redirect based on booking type
          const bookingType = paymentData?.bookingType || "";
          if (bookingType.includes("Pool")) {
            navigate("/pool");
          } else if (bookingType.includes("Event")) {
            navigate("/events");
          } else if (bookingType.includes("Sports") || bookingType.includes("Tennis") || bookingType.includes("Volleyball")) {
            navigate("/sports");
          } else if (bookingType.includes("Radio")) {
            navigate("/radio");
          } else {
            navigate("/");
          }
        }
      }, 3000);
    } catch (error: any) {
      console.error("Booking/Order creation error:", error);
      setPaymentStatus("error");
      setErrorMessage(
        error.response?.data?.detail || error.message || "Payment successful but failed to create booking. Please contact support."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    setErrorMessage("Payment was cancelled. You can try again.");
  };

  const handlePayment = () => {
    if (!paymentData) return;

    // For bookings, check availability one more time before payment
    if (paymentData.orderType === "booking" && isAvailable === false) {
      setErrorMessage(
        availabilityMessage || 
        "This slot is no longer available. Please go back and select a different time."
      );
      return;
    }

    const paymentEmail = email || user?.email || "";
    if (!paymentEmail || !paymentEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setErrorMessage("");
    setPaymentStatus("idle");

    // Trigger Paystack payment
    initializePayment({ onSuccess, onClose });
  };

  if (!paymentData || (paymentData.orderType === "booking" && paymentData.bookingType !== "Radio Advertisement" && isCheckingAvailability && isAvailable === null)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Checking availability...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (paymentStatus === "success") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-4">
                {paymentData.orderType === "delivery"
                  ? "Your order has been placed and will be delivered soon."
                  : "Your payment was successful! Your booking is pending admin approval. The admin will verify payment and confirm your booking."}
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-6 justify-center">
                <Shield className="w-4 h-4" />
                <span>Your payment was processed securely via Paystack</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Security Notice */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Secure Payment via Paystack
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Your payment is processed securely through Paystack. We accept all major cards and mobile money.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      A payment receipt will be sent to this email address
                    </p>
                  </div>

                  {/* Availability Check for Bookings */}
                  {paymentData?.orderType === "booking" && paymentData.bookingType !== "Radio Advertisement" && (
                    <div>
                      {isCheckingAvailability ? (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Checking availability...
                          </p>
                        </div>
                      ) : isAvailable === false ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                              Slot No Longer Available
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {availabilityMessage || "This slot has been booked by another customer. Please go back and select a different time."}
                            </p>
                          </div>
                        </div>
                      ) : isAvailable === true ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {availabilityMessage || "Slot is available. You can proceed with payment."}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>All transactions are secured with SSL encryption</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      You will be redirected to Paystack's secure payment page to complete your payment
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {paymentData.orderType === "delivery" ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <ChefHat className="w-5 h-5" />
                    )}
                    {paymentData.orderType === "delivery" ? "Order Summary" : "Booking Summary"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentData.orderType === "delivery" ? (
                    <>
                      <div>
                        <h4 className="font-semibold mb-2">Delivery Details</h4>
                        <p className="text-sm text-muted-foreground">
                          {paymentData.deliveryAddress}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {paymentData.deliveryPhone}
                        </p>
                        {paymentData.deliveryInstructions && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Instructions: </span>
                            {paymentData.deliveryInstructions}
                          </p>
                        )}
                      </div>
                      <Separator />
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-semibold mb-2">Booking Details</h4>
                        {paymentData.bookingType && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Type: </span>
                            {paymentData.bookingType}
                          </p>
                        )}
                        {paymentData.bookingName && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Name: </span>
                            {paymentData.bookingName}
                          </p>
                        )}
                        {paymentData.bookingPhone && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Phone: </span>
                            {paymentData.bookingPhone}
                          </p>
                        )}
                        {paymentData.bookingDate && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Date: </span>
                            {paymentData.bookingDate}
                          </p>
                        )}
                        {paymentData.bookingTime && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Time: </span>
                            {paymentData.bookingTime}
                          </p>
                        )}
                        {paymentData.guests && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Guests: </span>
                            {paymentData.guests}
                          </p>
                        )}
                        {paymentData.bookingDetails && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Details: </span>
                            {paymentData.bookingDetails}
                          </p>
                        )}
                        {paymentData.specialRequests && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Requests: </span>
                            {paymentData.specialRequests}
                          </p>
                        )}
                      </div>
                      <Separator />
                    </>
                  )}

                  {paymentData.items && paymentData.items.length > 0 && (
                    <>
                      <div>
                        <h4 className="font-semibold mb-2">Items</h4>
                        <div className="space-y-2">
                          {paymentData.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.name} x{item.quantity}
                              </span>
                              <span className="font-medium">
                                ₵{(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{paymentData.items && paymentData.items.length > 0 ? "Subtotal" : "Amount"}</span>
                      <span>₵{paymentData.total.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>
                        ₵{paymentData.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={
                      isProcessing || 
                      !email || 
                      !email.includes("@") || 
                      isCheckingAvailability || 
                      (paymentData?.orderType === "booking" && paymentData.bookingType !== "Radio Advertisement" && isAvailable === false)
                    }
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : isCheckingAvailability ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Checking Availability...
                      </>
                    ) : (paymentData?.orderType === "booking" && paymentData.bookingType !== "Radio Advertisement" && isAvailable === false) ? (
                      "Slot Unavailable"
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay with Paystack
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
