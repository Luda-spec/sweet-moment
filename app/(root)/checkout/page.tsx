'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Container, Title } from "@/components/shared";
import { Button, Input } from "@/components/ui";
import { useCartStore, useCartTotalPrice } from "@/store/cart";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Banknote,
  MapPin,
  Phone,
  User,
  Mail,
  Lock,
  Check,
  ChevronRight,
  Clock,
  Calendar,
  Truck,
  Gift,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { fetchAddressSuggestions, type AddressSuggestion } from "@/lib/dadata";
import { useWheelDiscount } from "@/hooks/useWheelDiscount";
import confetti from "canvas-confetti"; 

type PaymentMethod = "CASH" | "CARD";
type EmailForm = { email: string };

const BASE_DELIVERY_PRICE = 250;
const FREE_DELIVERY_THRESHOLD = 5000;

const DELIVERY_TIMES = [
  { id: "11:00-13:00", label: "11:00 - 13:00" },
  { id: "13:00-15:00", label: "13:00 - 15:00" },
  { id: "15:00-17:00", label: "15:00 - 17:00" },
  { id: "17:00-19:00", label: "17:00 - 19:00" },
  { id: "19:00-21:00", label: "19:00 - 21:00" },
];

const isSaintPetersburg = (address: string, suggestion?: AddressSuggestion): boolean => {
  const lower = address.toLowerCase();
  const spbVariants = [
    'санкт-петербург', 'спб', 'с-петербург', 'питер', 'ленинград',
    'г. санкт-петербург', 'г. спб', 'г.питер', 'г.ленинград'
  ];
  
  if (spbVariants.some(variant => lower.includes(variant))) return true;

  if (suggestion?.data) {
    const city = suggestion.data.city?.toLowerCase() || '';
    const region = suggestion.data.region?.toLowerCase() || '';
    if (city.includes('санкт-петербург') || city === 'спб' || region.includes('санкт-петербург')) {
      return true;
    }
  }
  return false;
};

const toLocalDateStr = (date: Date) => date.toLocaleDateString('sv-SE');

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartTotalPrice(); 
  
  const { discount, timeLeft, clearDiscount } = useWheelDiscount();

  const productsTotal = totalPrice;
  const discountAmount = discount > 0 ? Math.round(productsTotal * (discount / 100)) : 0;
  
  const isFreeDelivery = productsTotal >= FREE_DELIVERY_THRESHOLD;
  const currentDeliveryPrice = isFreeDelivery ? 0 : BASE_DELIVERY_PRICE;
  const finalTotal = productsTotal - discountAmount + currentDeliveryPrice;

  const progress = Math.min((productsTotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_DELIVERY_THRESHOLD - productsTotal, 0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const today = new Date();
  const maxDeliveryDate = new Date();
  maxDeliveryDate.setDate(today.getDate() + 5);

  const [selectedDate, setSelectedDate] = useState(toLocalDateStr(today));
  const [deliveryTime, setDeliveryTime] = useState("");
  
  const [comment, setComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  const { register, setValue, watch } = useForm<EmailForm>({
    defaultValues: { email: session?.user?.email || "" },
  });
  const email = watch("email");

  useEffect(() => {
    if (session?.user?.email) setValue("email", session.user.email);
  }, [session, setValue]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setFirstName(session.user.firstName || "");
      setLastName(session.user.lastName || "");
    }
  }, [session, status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressRef.current && !addressRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableTimes = useMemo(() => {
    const selected = new Date(selectedDate + 'T00:00:00');
    const now = new Date();
    const isToday = selected.toDateString() === now.toDateString();

    return DELIVERY_TIMES.filter(slot => {
      if (!isToday) return true;
      
      const [start] = slot.id.split('-');
      const [hour, minute] = start.split(':').map(Number);
      const slotStart = new Date(selected);
      slotStart.setHours(hour, minute, 0, 0);
      
      return slotStart > now;
    });
  }, [selectedDate]);

  useEffect(() => {
    if (!availableTimes.find(t => t.id === deliveryTime)) {
      setDeliveryTime("");
    }
  }, [availableTimes, deliveryTime]);

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setSelectedSuggestion(null); 
    
    if (value.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsLoadingAddresses(true);
    const suggestions = await fetchAddressSuggestions(value);
    setAddressSuggestions(suggestions);
    setShowSuggestions(true);
    setIsLoadingAddresses(false);
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setAddress(suggestion.value);
    setSelectedSuggestion(suggestion); 
    setShowSuggestions(false);
    setAddressSuggestions([]);
    
    if (!isSaintPetersburg(suggestion.value, suggestion)) {
      toast.error("Доставка только по Санкт-Петербургу", {
        description: "К сожалению, мы доставляем заказы только в пределах СПб и ЛО"
      });
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    let formatted = "+7";
    if (digits.length > 1) formatted += ` (${digits.slice(1, 4)}`;
    if (digits.length > 4) formatted += `) ${digits.slice(4, 7)}`;
    if (digits.length > 7) formatted += `-${digits.slice(7, 9)}`;
    if (digits.length > 9) formatted += `-${digits.slice(9, 11)}`;
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return /^7\d{10}$|^8\d{10}$/.test(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSaintPetersburg(address, selectedSuggestion || undefined)) {
      toast.error("Доставка только по Санкт-Петербургу", {
        description: "К сожалению, мы доставляем заказы только в пределах СПб и ЛО",
        duration: 5000,
      });
      return;
    }
    
    if (!firstName || !lastName || !email || !phone || !address || !selectedDate || !deliveryTime) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Введите корректный телефон");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            imageUrl: item.imageUrl,
            fillingName: item.fillingName,
            weight: item.weight,
          })),
          totalAmount: finalTotal,
          deliveryPrice: currentDeliveryPrice,
          discountApplied: discount > 0 ? { value: discount, amount: discountAmount } : null,
          fullName: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          address,
          deliveryDate: selectedDate, 
          deliveryTime,               
          comment,
          paymentMethod,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success("Заказ оформлен!", { description: `Номер заказа: #${result.orderId}` });
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f87171', '#60a5fa', '#34d399'],
        disableForReducedMotion: true,
      });
      
      clearDiscount();
      clearCart();
      router.push(`/orders`);
    } catch (error) {
      console.error('Order error:', error);
      toast.error("Ошибка оформления заказа");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <Title text="Корзина пуста" size="lg" />
        <p className="text-gray-500 mt-2">Добавьте товары, чтобы оформить заказ</p>
        <Button className="mt-6" onClick={() => router.push("/")}>В каталог</Button>
      </Container>
    );
  }

  return (
    <Container className="py-10 px-4 md:px-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        <Title text="Оформление заказа" size="lg" className="font-extrabold mb-8 md:ml-1" />
        
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-lg text-sm font-bold">1</span>
            <h3 className="text-lg font-bold">Корзина</h3>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  {(item.weight || item.fillingName) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[item.weight && `${item.weight}г`, item.fillingName].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-500">× {item.quantity}</p>
                  <p className="font-semibold text-gray-900">{item.price * item.quantity} ₽</p>
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-primary" />
                <div>
                  <p className="font-medium text-gray-900">Доставка</p>
                  <p className="text-xs text-gray-500">По Санкт-Петербургу и ЛО</p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">{currentDeliveryPrice} ₽</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-lg text-sm font-bold">2</span>
            <h3 className="text-lg font-bold">Персональная информация</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <User size={14} className="text-gray-400" /> Имя *
              </label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Иван" className="h-11 focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <User size={14} className="text-gray-400" /> Фамилия *
              </label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Иванов" className="h-11 focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" /> Email <Lock size={12} className="text-gray-300" />
              </label>
              <Input {...register("email")} disabled className="h-11 bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Phone size={14} className="text-gray-400" /> Телефон *
              </label>
              <Input value={phone} onChange={handlePhoneChange} placeholder="+7 (999) 000-00-00" className="h-11 focus:border-primary focus:ring-2 focus:ring-primary/10 transition" maxLength={18} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-lg text-sm font-bold">3</span>
            <h3 className="text-lg font-bold">Адрес и доставка</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 relative" ref={addressRef}>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" /> Адрес *
              </label>
              <div className="relative">
                <Input
                  value={address}
                  onChange={handleAddressChange}
                  onFocus={() => address.length >= 3 && setShowSuggestions(true)}
                  placeholder="ул. Примерная, д. 10, кв 3"
                  className="h-11 focus:border-primary focus:ring-2 focus:ring-primary/10 transition pr-10"
                />
                {isLoadingAddresses && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {showSuggestions && (addressSuggestions.length > 0 || isLoadingAddresses) && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {isLoadingAddresses ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">Загрузка...</div>
                  ) : (
                    addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAddressSelect(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-start gap-2 border-b border-gray-100 last:border-0"
                      >
                        <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{suggestion.value}</p>
                          {suggestion.data.city && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {[suggestion.data.city, suggestion.data.street, suggestion.data.house].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                        {!isSaintPetersburg(suggestion.value, suggestion) && (
                          <span className="text-xs text-red-500 font-medium shrink-0">✕ не доставляем</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">🚚 Доставка доступна только по Санкт-Петербургу и ЛО</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" /> Дата доставки *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={toLocalDateStr(today)}
                max={toLocalDateStr(maxDeliveryDate)}
                className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition bg-white cursor-pointer"
              />
              <p className="text-xs text-gray-400">Можно выбрать дату от сегодня до {maxDeliveryDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" /> Время доставки *
              </label>
              
              {availableTimes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time.id}
                      type="button"
                      onClick={() => setDeliveryTime(time.id)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                        deliveryTime === time.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {time.label}
                      {deliveryTime === time.id && <Check size={16} className="inline ml-1" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                  ⚠️ На выбранную дату нет свободных интервалов. Пожалуйста, выберите другую дату или оформите заказ позже.
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Комментарий</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Например: позвонить за 15 минут до доставки"
                className="w-full h-24 p-3 border border-gray-200 rounded-xl resize-none focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition bg-white"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-lg text-sm font-bold">4</span>
            <h3 className="text-lg font-bold">Способ оплаты</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all cursor-pointer text-left ${
                paymentMethod === "CASH" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                paymentMethod === "CASH" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <Banknote size={18} />
              </div>
              <div>
                <p className={`font-semibold ${paymentMethod === "CASH" ? "text-primary" : "text-gray-900"}`}>Наличные</p>
                <p className="text-xs text-gray-500">Курьеру при получении</p>
              </div>
              {paymentMethod === "CASH" && <Check size={18} className="ml-auto text-primary" />}
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("CARD")}
              className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all cursor-pointer text-left ${
                paymentMethod === "CARD" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                paymentMethod === "CARD" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <CreditCard size={18} />
              </div>
              <div>
                <p className={`font-semibold ${paymentMethod === "CARD" ? "text-primary" : "text-gray-900"}`}>Карта</p>
                <p className="text-xs text-gray-500">Курьеру при получении</p>
              </div>
              {paymentMethod === "CARD" && <Check size={18} className="ml-auto text-primary" />}
            </button>
          </div>
        </section>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm bottom-4 z-10">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Товары</span>
              <span className="font-medium">{productsTotal} ₽</span>
            </div>
            
            {remaining > 0 ? (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  До бесплатной доставки осталось <span className="font-bold">{remaining} ₽</span>
                </p>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 font-medium flex items-center gap-2">
                <Truck size={16} /> Доставка бесплатно!
              </div>
            )}
            
            {discount > 0 && (
              <>
                <div className="flex justify-between items-center text-sm p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-1.5">
                    <Gift size={14} className="text-orange-500" />
                    <span className="font-medium text-orange-700">Скидка {discount}%</span>
                  </div>
                  {timeLeft && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {timeLeft}
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Скидка</span>
                  <span>-{discountAmount} ₽</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Доставка</span>
              <span className={`font-medium ${isFreeDelivery ? 'text-green-600' : ''}`}>
                {isFreeDelivery ? 'Бесплатно' : `${currentDeliveryPrice} ₽`}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Итого</span>
              <span className="text-2xl font-black text-gray-900">{finalTotal} ₽</span>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || availableTimes.length === 0}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Оформление...
              </>
            ) : (
              <>
                Оформить за {finalTotal} ₽
                <ChevronRight size={18} />
              </>
            )}
          </Button>
        </div>

      </form>
    </Container>
  );
}