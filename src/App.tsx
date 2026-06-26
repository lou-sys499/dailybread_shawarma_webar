import { 
  ShoppingCart, 
  View, 
  Minus, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Check, 
  X, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Mail, 
  Map, 
  Send, 
  Star, 
  Coffee, 
  Sparkles, 
  Award, 
  PartyPopper, 
  UtensilsCrossed 
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { ThreeDPhotoEffect } from './components/ThreeDPhotoEffect';
import './types';

// Bind MeshoptDecoder globally immediately so that <model-viewer> internal THREE.GLTFLoader auto-detects it.
if (typeof window !== 'undefined') {
  if (!(window as any).MeshoptDecoder && (self as any).MeshoptDecoder) {
    (window as any).MeshoptDecoder = (self as any).MeshoptDecoder;
  } else if ((window as any).MeshoptDecoder && !(self as any).MeshoptDecoder) {
    (self as any).MeshoptDecoder = (window as any).MeshoptDecoder;
  }
}

// Structured Product Data
interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  rating: number;
  ordersCount: string;
  isCustomizable: boolean;
  badge: string;
}

// Structured Order item in cart
interface CartItem {
  id: string;
  name: string;
  quantity: number;
  options: string[];
  zoboQty: number;
  fruitJuiceQty: number;
  noteText: string;
  unitPrice: number;
  totalPrice: number;
}

export default function App() {
  // Products definition
  const products: Product[] = [
    {
      id: "signature-beef",
      name: "DailyBread Shawarma",
      description: "Thinly sliced beef, a rich, creamy sauce primarily made from mayonnaise and ketchup, often mixed with a touch of garlic, onion and pepper for a spicy kick, all tightly wrapped in our thin, soft Lebanese flatbread.",
      basePrice: 1000,
      image: "https://www.corriecooks.com/wp-content/uploads/2023/08/beefshawarma.jpg",
      rating: 4.9,
      ordersCount: "1.2k+ ordered this week",
      isCustomizable: true,
      badge: "Best Seller"
    },
    {
      id: "crispy-chicken",
      name: "Zobo(Hibiscus Drink)",
      description: "A refreshing, ice-cold premium hibiscus infusion brewed with aromatic local spices, fresh ginger, and a touch of sweetness.",
      basePrice: 500,
      image: "https://mamaashanti.co.ke/wp-content/uploads/2024/06/Zobo-scaled.jpg",
      rating: 4.8,
      ordersCount: "1.5k+ orders this week",
      isCustomizable: true,
      badge: "Ice Cold Drink"
    },
    {
      id: "supreme-double",
      name: "Fresh Fruit Juice",
      description: "Freshly squeezed local citrus, pineapples, and seasonal fruits. Pure natural goodness with zero artificial preservatives.",
      basePrice: 500,
      image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",
      rating: 5.0,
      ordersCount: "Vitamin Booster",
      isCustomizable: true,
      badge: "100% Organic"
    },
    {
      id: "veggie-falafel",
      name: "Omlette(Potatoes & Eggs)",
      description: "Fluffy seasoned local farm eggs scrambled with pan-grilled golden potatoes, sweet peppers, and standard Cameroonian spices.",
      basePrice: 900,
      image: "https://img.freepik.com/premium-photo/close-up-omelet-with-french-fries-plate-table_1605434-2146.jpg",
      rating: 4.7,
      ordersCount: "Hot All-Day Classic",
      isCustomizable: true,
      badge: "Savory Plate"
    }
  ];

  // Core Product Customizer state
  const [activeProduct, setActiveProduct] = useState<Product>(products[0]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [zoboQty, setZoboQty] = useState<number>(0);
  const [fruitJuiceQty, setFruitJuiceQty] = useState<number>(0);
  const [noteText, setNoteText] = useState<string>('');

  // 3D Model customized asset state with automatic error fallback & multi-path matching
  const fallbackModelUrl = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
  const fallbackUsdzUrl = "https://modelviewer.dev/shared-assets/models/Astronaut.usdz";
  
  const candidates = React.useMemo(() => {
    const buster = Date.now();
    return [
      {
        glb: `/3d_shawarma_sample-specimen-v1.glb`,
        usdz: `https://cdn.jsdelivr.net/gh/lou-sys499/dailybread_shawarma_webar@main/3d_shawarma_sample-specimen-v1.usdz?t=${buster}`
      },
      {
        glb: `https://cdn.jsdelivr.net/gh/lou-sys499/dailybread_shawarma_webar@main/3d_shawarma_sample-specimen-v1.glb?t=${buster}`,
        usdz: `https://cdn.jsdelivr.net/gh/lou-sys499/dailybread_shawarma_webar@main/3d_shawarma_sample-specimen-v1.usdz?t=${buster}`
      },
      {
        glb: `https://raw.githubusercontent.com/lou-sys499/dailybread_shawarma_webar/main/3d_shawarma_sample-specimen-v1.glb?t=${buster}`,
        usdz: `https://raw.githubusercontent.com/lou-sys499/dailybread_shawarma_webar/main/3d_shawarma_sample-specimen-v1.usdz?t=${buster}`
      }
    ];
  }, []);

  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [modelUrl, setModelUrl] = useState<string>(fallbackModelUrl);
  const [usdzUrl, setUsdzUrl] = useState<string>(fallbackUsdzUrl);
  const [glbLoadError, setGlbLoadError] = useState<boolean>(false);
  const [isMeshoptReady, setIsMeshoptReady] = useState<boolean>(false);
  const modelViewerRef = React.useRef<any>(null);

  // Guarantee MeshoptDecoder is loaded globally and compiled before custom GLB models load
  useEffect(() => {
    let active = true;
    let intervalId: any = null;

    async function initMeshopt() {
      const win = window as any;
      let attempts = 0;
      const maxAttempts = 50; // Wait up to 5 seconds

      const checkDecoder = async (): Promise<boolean> => {
        if (win.MeshoptDecoder) {
          try {
            if (win.MeshoptDecoder.ready) {
              await win.MeshoptDecoder.ready;
            }
            if (active) {
              console.log("Global MeshoptDecoder is fully compiled, ready, and active.");
              setIsMeshoptReady(true);
            }
            return true;
          } catch (e) {
            console.error("MeshoptDecoder ready promise error:", e);
            if (active) setIsMeshoptReady(true);
            return true;
          }
        }
        return false;
      };

      // Check immediately
      const found = await checkDecoder();
      if (found) return;

      // Poll periodically if not found yet (waiting for index.html's CDN sequential loader)
      intervalId = setInterval(async () => {
        attempts++;
        const resolved = await checkDecoder();
        if (resolved || attempts >= maxAttempts) {
          clearInterval(intervalId);
          if (!resolved && active) {
            console.warn("MeshoptDecoder not found after 5s polling, proceeding anyway.");
            setIsMeshoptReady(true);
          }
        }
      }, 100);
    }

    initMeshopt();

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Set the active GLB source based on candidate validation
  useEffect(() => {
    if (!isMeshoptReady) return;

    if (candidateIndex < candidates.length) {
      console.log(`Loading candidate #${candidateIndex}: ${candidates[candidateIndex].glb}`);
      setModelUrl(candidates[candidateIndex].glb);
      setUsdzUrl(candidates[candidateIndex].usdz);
    } else {
      console.warn("All candidates exhausted. Gracefully fallback loaded a certified digital specimen.");
      setGlbLoadError(true);
      setModelUrl(fallbackModelUrl);
      setUsdzUrl(fallbackUsdzUrl);
    }
  }, [isMeshoptReady, candidateIndex, candidates]);

  // Model loading and recovery event listener hook
  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    const handleError = (event: any) => {
      console.warn(`Model-viewer reported a loading/parsing issue on candidate #${candidateIndex}:`, modelUrl, event);
      if (modelUrl !== fallbackModelUrl) {
        setCandidateIndex(prev => prev + 1);
      } else {
        setGlbLoadError(true);
      }
    };

    const handleLoad = () => {
      if (modelUrl !== fallbackModelUrl) {
        console.log("3D Custom Model loaded successfully:", modelUrl);
        setGlbLoadError(false);
      }
    };

    modelViewer.addEventListener('error', handleError);
    modelViewer.addEventListener('load', handleLoad);

    return () => {
      modelViewer.removeEventListener('error', handleError);
      modelViewer.removeEventListener('load', handleLoad);
    };
  }, [modelUrl, candidateIndex]);

  // Gyroscope and Accelerometer tilt tracker effect for `<model-viewer>`
  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0; // target roll / yaw deviation (in degrees)
    let targetY = 0; // target pitch deviation (in degrees)
    let currentX = 0;
    let currentY = 0;
    let fallbackMouseActive = false;

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;
      
      const beta = event.beta;
      const gamma = event.gamma;

      // Limit deflection angles to avoid wild spins (max +/- 30 degrees)
      const clampedGamma = Math.max(-30, Math.min(30, gamma));
      const clampedBeta = Math.max(-23, Math.min(23, beta));

      // Map to orientation target with a smart handbook typing-offset tilt (Beta held at roughly 50 degs)
      targetX = clampedGamma * 0.75; 
      targetY = (clampedBeta - 48) * 0.65;
      fallbackMouseActive = false;
    };

    // Desktop mouse-movement projection fallback
    const handleMouseMove = (event: MouseEvent) => {
      const container = modelViewerRef.current?.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const isHoveringViewer = (
        event.clientX >= rect.left - 150 &&
        event.clientX <= rect.right + 150 &&
        event.clientY >= rect.top - 150 &&
        event.clientY <= rect.bottom + 150
      );

      if (isHoveringViewer) {
        fallbackMouseActive = true;
        const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const normalizedY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        
        targetX = normalizedX * 22; 
        targetY = -normalizedY * 18; 
      } else if (fallbackMouseActive) {
        targetX = 0;
        targetY = 0;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const updateLoop = () => {
      const modelViewer = modelViewerRef.current;
      if (modelViewer) {
        // High-performance smooth butter-interpolation loop
        currentX += (targetX - currentX) * 0.085;
        currentY += (targetY - currentY) * 0.085;

        // Apply roll and pitch tilt values directly onto `<model-viewer>`'s orientation attribute
        modelViewer.setAttribute('orientation', `0deg ${currentY}deg ${currentX}deg`);
      }
      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Cart & Orders state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState<boolean>(false);

  // Live eatery local time validation state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);
  const [isEateryOpen, setIsEateryOpen] = useState<boolean>(true);

  // Catering form state
  const [cateringForm, setCateringForm] = useState({
    name: '',
    phone: '',
    eventType: 'Birthday Celebration',
    guests: '20-50 guests',
    date: '',
    details: ''
  });
  const [cateringStatus, setCateringStatus] = useState<string | null>(null);

  // Exclusions checkboxes
  const customizations = [
    "No pepper",
    "No tomatoes",
    "No Onions"
  ];

  // Cameroonian support number & physical address details
  const phoneNumber = "+237652351693";
  const formattedPhoneDisplay = "+237 6 52 35 16 93";
  const addressDisplay = "beside Bishop Store, Bokwaongo Junction, Buea, Cameroon";
  const mapsLink = "https://maps.app.goo.gl/e1wFCcqxSkREmRnY7";
  
  // Real-time Operating Hours Calculations: Open Tue-Sun 1:00 PM to 10:30 PM
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
      
      // Determine active hour
      const activeHour = simulatedHour !== null ? simulatedHour : now.getHours();
      const currentMinutes = now.getMinutes();
      const decimalTime = activeHour + currentMinutes / 60;

      if (currentDay === 1) {
        // Closed on Monday
        setIsEateryOpen(false);
      } else {
        // Open 1:00 PM to 10:30 PM (13.0 to 22.5)
        setIsEateryOpen(decimalTime >= 13.0 && decimalTime <= 22.5);
      }
    };
    checkStatus();
  }, [currentTime, simulatedHour]);

  // Pricing constants for the live customizer
  const basePricePerUnit = activeProduct.basePrice;
  const zoboPrice = zoboQty * 500;
  const fruitJuicePrice = fruitJuiceQty * 500;
  const currentUnitPrice = basePricePerUnit + zoboPrice + fruitJuicePrice;
  const currentTotalPrice = currentUnitPrice * quantity;

  // Toggle exclusion tags
  const toggleOption = (option: string) => {
    setSelectedOptions((prev) => 
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity((q) => q + 1);
  };

  // Switch customizable product in focus
  const handleProductSelection = (product: Product) => {
    setActiveProduct(product);
    setSelectedOptions([]);
    setQuantity(1);
    setZoboQty(0);
    setFruitJuiceQty(0);
    setNoteText('');
  };

  // Add customized item to general cart state
  const addToCart = () => {
    const newItem: CartItem = {
      id: Date.now().toString(),
      name: activeProduct.name,
      quantity,
      options: [...selectedOptions],
      zoboQty,
      fruitJuiceQty,
      noteText: noteText.trim(),
      unitPrice: currentUnitPrice,
      totalPrice: currentTotalPrice,
    };

    setCart((prev) => [...prev, newItem]);
    
    // Clear customizer state after successful push
    setSelectedOptions([]);
    setQuantity(1);
    setZoboQty(0);
    setFruitJuiceQty(0);
    setNoteText('');
    
    // Auto toggle drawer
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Builds direct single item instant WhatsApp redirection link
  const buildInstantWhatsAppLink = (productName: string, qty: number, baseRate: number, exclusions: string[], zQty: number, jQty: number, notes: string) => {
    const totalAddons = (zQty * 500) + (jQty * 500);
    const unitPrice = baseRate + totalAddons;
    const finalAmount = unitPrice * qty;

    let text = `*New Order: DailyBread Shawarma (Bokwaongo Junction, Buea)*\n\n`;
    text += `Hello, I'd like to place an order for delivery/pickup:\n\n`;
    text += `🍔 *Product:* ${productName}\n`;
    text += `🔢 *Quantity:* ${qty} unit${qty > 1 ? 's' : ''}\n`;
    
    if (exclusions.length > 0) {
      text += `🚫 *Exclusions:* ${exclusions.join(', ')}\n`;
    }
    if (zQty > 0) {
      text += `🍹 *Zobo Add-on:* x${zQty} (+${zQty * 500} XAF)\n`;
    }
    if (jQty > 0) {
      text += `🍊 *Juice Add-on:* x${jQty} (+${jQty * 500} XAF)\n`;
    }
    if (notes.trim()) {
      text += `📝 *Notes:* "${notes.trim()}"\n`;
    }
    text += `\n💵 *Total Price:* *${finalAmount} XAF*\n\n`;
    text += `📍 *Location/Inquiry:* Please deliver to me in Buea.\n`;
    text += `📞 My support reference contact is: ${phoneNumber}`;
    
    return `https://wa.me/237652351693?text=${encodeURIComponent(text)}`;
  };

  // Checkout complete cart items block to WhatsApp API
  const buildCartWhatsAppRequest = () => {
    let text = `*DailyBread Shawarma Order - Bokwaongo Junction, Buea*\n\n`;
    text += `Hi DailyBread, I want to confirm my checkout order:\n\n`;

    cart.forEach((item, idx) => {
      text += `*${idx + 1}. ${item.name}* (Qty: ${item.quantity})\n`;
      text += `   • Unit Price: ${item.unitPrice} XAF\n`;
      if (item.options.length > 0) {
        text += `   • Excludes: ${item.options.join(', ')}\n`;
      }
      if (item.zoboQty > 0) {
        text += `   • Zobo Drinks: x${item.zoboQty}\n`;
      }
      if (item.fruitJuiceQty > 0) {
        text += `   • Fruit Juice: x${item.fruitJuiceQty}\n`;
      }
      if (item.noteText) {
        text += `   • Instructions: "${item.noteText}"\n`;
      }
      text += `   • Subtotal: *${item.totalPrice} XAF*\n\n`;
    });

    text += `--------------------------------\n`;
    text += `💰 *Grand Total: ${totalCartPrice} XAF*\n\n`;
    text += `📍 Please deliver this to me in Buea.\n`;
    text += `📞 Support reference: ${phoneNumber}`;

    return `https://wa.me/237652351693?text=${encodeURIComponent(text)}`;
  };

  const handleCheckout = () => {
    setShowCheckoutSuccess(true);
    setCart([]);
  };

  // Interactive Catering Form Submission to WhatsApp
  const handleCateringBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cateringForm.name || !cateringForm.phone) {
      setCateringStatus("Please enter your name and phone number.");
      return;
    }

    let message = `*Catering & Event Inquiry - DailyBread Shawarma (Buea)*\n\n`;
    message += `Hi DailyBread team, I am interested in booking catering services for an upcoming event:\n\n`;
    message += `👤 *Customer Name:* ${cateringForm.name}\n`;
    message += `📞 *Phone Number:* ${cateringForm.phone}\n`;
    message += `🎉 *Event Category:* ${cateringForm.eventType}\n`;
    message += `👥 *Estimated Guests:* ${cateringForm.guests}\n`;
    message += `📅 *Planned Date:* ${cateringForm.date || 'TBD'}\n`;
    if (cateringForm.details) {
      message += `📝 *Additional Requests:* ${cateringForm.details}\n`;
    }
    message += `\nPlease let me know your packages and schedule. Thank you!`;

    const fullWaLink = `https://wa.me/237652351693?text=${encodeURIComponent(message)}`;
    
    // Provide success response and redirect
    setCateringStatus("Redirecting to WhatsApp for confirmation...");
    setTimeout(() => {
      window.open(fullWaLink, "_blank");
      setCateringStatus("Inquiry Sent Successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-accent-1/30 relative pb-20 md:pb-0 animate-fade-in">
      
      {/* 1. Header with Sticky Top Bar details */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-brand-text/5 shadow-sm transition-all font-ui">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <a href="/" className="shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl overflow-hidden bg-brand-primary/10">
                 <img 
                   src="https://i.ibb.co/8Lf5DQvS/dailybread-shawarma-logo-copy.webp" 
                   alt="dailybread shawarma logo" 
                   className="w-full h-full object-cover" 
                   referrerPolicy="no-referrer"
                 />
             </a>
             <div>
               <div className="text-xl md:text-2xl font-heading font-extrabold tracking-tight text-brand-primary leading-none">DailyBread</div>
               <p className="text-[11px] text-brand-text/70 font-ui font-semibold tracking-wider uppercase mt-1">Shawarma & Grill • Buea</p>
             </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-brand-text/80">
            <a href="#menu" className="hover:text-brand-primary transition-colors">Our Menu</a>
            <a href="#about" className="hover:text-brand-primary transition-colors">About Us</a>
            <a href="#catering" className="hover:text-brand-primary transition-colors">Catering & Events</a>
            <a href="#hours" className="hover:text-brand-primary transition-colors">Opening Hours</a>
            <a href="#location" className="hover:text-brand-primary transition-colors">Find Us</a>
          </div>

          <div className="flex items-center gap-3 font-ui">
            {/* Click-to-call Customer Support on Header */}
            <a 
              href={`tel:${phoneNumber}`} 
              className="hidden sm:flex items-center gap-2 bg-brand-text/5 border border-brand-text/10 hover:bg-brand-text/10 text-brand-text px-4 py-2 rounded-full text-sm font-bold transition-all"
              title="Call Customer Support Directly"
            >
              <Phone size={15} className="text-brand-primary" />
              <span className="font-mono">{formattedPhoneDisplay}</span>
            </a>

            {/* Cart Icon trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-brand-text text-white px-4 md:px-5 py-2.5 rounded-full font-bold hover:bg-brand-primary transition-all transform hover:scale-[1.02] shadow-sm relative cursor-pointer"
              id="cart-header-icon"
            >
              <ShoppingCart size={16} />
              <span className="text-xs md:text-sm">Cart ({totalCartQuantity})</span>
              {totalCartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {totalCartQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Open/Closed Header Status Alert Banner */}
      <div className={`py-2 px-4 text-center text-xs font-bold transition-colors ${
        isEateryOpen 
          ? "bg-green-50 text-green-800 border-b border-green-100" 
          : "bg-red-50 text-red-800 border-b border-red-100"
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isEateryOpen ? "bg-green-600 animate-ping" : "bg-red-600"}`}></span>
            {isEateryOpen ? "🟢 OPEN NOW" : "🔴 CLOSED NOW"}
          </span>
          <span className="hidden sm:inline">|</span>
          <span>Eatery Hours: Tue - Sun (1:00 PM to 10:30 PM). Monday: CLOSED.</span>
          <span className="font-normal text-[10px] bg-black/5 px-2 py-0.5 rounded-md">Located beside Bishop Store, Bokwaongo Junction, Buea</span>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-bg via-brand-bg to-orange-100/40 py-12 md:py-20 border-b border-brand-text/5">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-100/80 text-orange-950 border border-orange-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-ui">
              <Sparkles size={13} className="text-brand-primary animate-spin" />
              <span>Best Shawarma Hub in Buea</span>
            </div>

            <div className="space-y-4">
              <div className="tagline text-base sm:text-lg md:text-3xl font-bold text-brand-primary lowercase tracking-wider mb-2">vibrant • handcrafted • authentic</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight text-brand-text leading-none">
                Savor the Best <span className="text-brand-primary underline decoration-brand-accent-1/30">Shawarma</span> in Buea | DailyBread
              </h1>
              <p className="text-base md:text-lg text-brand-text/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
                Thinly sliced seasoned beef, fresh organic grown tomatoes and crisp potato fries rolled tightly in freshly grilled Lebanese flatbread. Handcrafted daily <span className="font-bold underline decoration-brand-primary text-brand-primary">beside Bishop Store, Bokwaongo Junction, Buea, Cameroon</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start font-ui">
              <a 
                href="#menu" 
                className="bg-brand-primary text-white hover:bg-brand-accent-2 text-center font-bold px-8 py-4 rounded-xl shadow-lg shadow-brand-primary/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Customize & Order Now</span>
                <ChevronRight size={18} />
              </a>
              <a 
                href="#location"
                className="bg-white hover:bg-stone-50 text-brand-text border border-brand-text/15 text-center font-bold px-8 py-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <MapPin size={18} className="text-brand-primary" />
                <span>Get Directions (Maps Pin)</span>
              </a>
            </div>

            <div className="pt-2 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-brand-text/60 text-xs font-semibold font-ui">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                <span>Fast WhatsApp Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                <span>Cozy Dine-In seating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                <span>Premium local ingredients</span>
              </div>
            </div>
          </div>

          {/* Hero Graphic - Featuring visual badge, delivery tag & catering booking CTA */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <ThreeDPhotoEffect />

            {/* Overlapping Floating Banner */}
            <div className="absolute -bottom-5 -right-2 md:-right-6 bg-amber-500 text-white rounded-2xl p-4 shadow-xl border border-amber-400 max-w-xs animate-bounce duration-1000 hidden sm:block z-45">
              <div className="flex items-center gap-3">
                 <div className="bg-white text-amber-600 rounded-full w-10 h-10 flex items-center justify-center shrink-0 shadow">
                   <Clock size={20} strokeWidth={2.5} />
                 </div>
                 <div>
                   <p className="text-stone-900 text-xs font-black uppercase tracking-wider leading-none">Fresh Batch Out!</p>
                   <p className="text-white text-xs font-bold mt-1">Get 100% warm, authentic beef rolls right now.</p>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Extra Local trust banner */}
      <div className="bg-brand-text text-stone-100 py-6 pr-4 pl-4 text-center font-ui">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-around gap-4 text-sm font-semibold">
          <div className="flex items-center justify-center gap-3">
             <div className="bg-brand-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">⭐</div>
             <span>No.1 Top-Rated Shawarma Spot in Buea, Cameroon</span>
          </div>
          <div className="flex items-center justify-center gap-3">
             <div className="bg-brand-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">📍</div>
             <span>Proudly Serving Bokwaongo, Molyko, & Great Soppo</span>
          </div>
          <div className="flex items-center justify-center gap-3">
             <div className="bg-brand-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">💬</div>
             <span>Instant Order Dispatch to WhatsApp</span>
          </div>
        </div>
      </div>

      {/* 3. Products & Menu Customizer Section */}
      <section id="menu" className="py-16 md:py-24 max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Intro header with Buea local search optimizer words */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-brand-text tracking-tight">
            Explore DailyBread Menu
          </h2>
          <p className="text-brand-text/70 font-semibold tracking-wider uppercase text-xs font-ui">
            Handcrafted Arabic & Cameroonian Fusion Cuisine
          </p>
          <p className="text-brand-text/80 text-sm font-sans">
            Select your preferred base wrap from our options, check exclusions, add premium local side compliments with dynamic real-time price updates, then place your order on WhatsApp instantly.
          </p>

          {/* Quick Menu Category Selector Buttons */}
          <div className="flex flex-wrap justify-center gap-2 pt-4 font-ui">
            {products.map((item) => (
              <button
                key={item.id}
                onClick={() => handleProductSelection(item)}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                  activeProduct.id === item.id
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                    : "bg-stone-100 hover:bg-stone-200 text-brand-text"
                }`}
              >
                {item.name} • {item.basePrice} XAF
              </button>
            ))}
          </div>
        </div>

        {/* 3D AR Interactive Customizer Engine */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-brand-text/5 max-w-5xl mx-auto">
          
          {/* Column A: Interactive 3D Model-viewer / High-res fallback with dynamic pricing status badge */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative bg-stone-50 rounded-2xl shadow-inner border border-stone-200 overflow-hidden aspect-square flex items-center justify-center group isolate">
              
              <model-viewer
                ref={modelViewerRef}
                src={modelUrl}
                ios-src={usdzUrl}
                alt={activeProduct.id === "signature-beef" ? "DailyBread Premium Grilled Beef Shawarma" : `${activeProduct.name} 3D Realistic Model`}
                auto-rotate
                camera-controls
                ar
                ar-modes="webxr scene-viewer quick-look"
                shadow-intensity="1.2"
                className="w-full h-full bg-transparent z-0"
                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
              >
                <div slot="poster" className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 p-4 text-center">
                   <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover absolute inset-0 opacity-70" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-white text-center">
                     <div className="animate-pulse w-14 h-14 bg-brand-accent-1 rounded-full flex items-center justify-center mb-2">
                       <Sparkles size={24} />
                     </div>
                     <span className="font-bold text-sm">3D AR visual mode ready</span>
                     <span className="text-[10px] text-stone-250 mt-1 max-w-xs">Drag inside the box to rotate or tap view in AR to project inside your room!</span>
                   </div>
                </div>
                
                {/* Custom AR Button slot */}
                <button
                  slot="ar-button"
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-brand-text px-6 py-3 rounded-full font-black shadow-xl border border-stone-200 flex items-center gap-2 hover:bg-brand-bg transition-all transform hover:scale-105 active:scale-95 cursor-pointer z-20 text-xs font-ui"
                >
                  <View size={16} className="text-brand-primary" />
                  <span>PROJECT AR VIEW</span>
                </button>
              </model-viewer>
              
              <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-sm text-brand-bg text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md z-10 font-mono">
                Interactive Food Specimen
              </div>

              <div className="absolute bottom-4 left-4 bg-stone-950/80 backdrop-blur-sm text-amber-400 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-amber-400/20 z-10 font-mono flex items-center gap-1.5 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-450 animate-ping"></span>
                <span>3D Gyro/Tilt Active</span>
              </div>

              {activeProduct.badge && (
                <div className="absolute top-4 right-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md z-10 shadow-sm font-ui">
                  {activeProduct.badge}
                </div>
              )}

              {/* Graceful Fallback Warning Banner overlay */}
              {glbLoadError && (
                <div className="absolute bottom-4 left-4 right-4 bg-amber-50/95 border border-amber-200 p-2.5 rounded-lg shadow-md z-10 flex items-start gap-2 text-stone-850 animate-fade-in">
                  <div className="text-base shrink-0">⚠️</div>
                  <div className="text-[10px] leading-tight font-sans">
                    <span className="font-bold block text-amber-800">Dynamic Asset Offline</span>
                    Your custom-hosted GLB file returned a 404 from the CDN repo. We have fallback loaded a certified digital specimen.
                  </div>
                </div>
              )}
            </div>
            
            {/* Disclaimer regarding the 3D specimens */}
            <p className="text-[10px] text-brand-text/60 text-center leading-normal">
              Disclaimer: While our interactive 3D preview lets you explore the wrap from every angle, nothing beats the real thing! Your fresh, custom-made shawarma will arrive hot, delicious, and hand-wrapped in foil.
            </p>


          </div>

          {/* Column B: Interactive Food Customization Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-brand-primary mb-1">
                <span className="text-xs bg-brand-primary/10 px-2 py-0.5 rounded-md font-bold uppercase font-mono">{activeProduct.ordersCount}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold font-heading text-brand-text tracking-tight">{activeProduct.name}</h3>
              <p className="text-sm text-brand-text/80 mt-2 leading-relaxed">
                {activeProduct.description}
              </p>
            </div>

            {/* Unit, Addons and Calculations */}
            <div className="grid grid-cols-2 gap-4 border-y border-brand-text/10 py-4 bg-stone-50/50 px-4 rounded-xl">
              <div>
                <span className="text-[10px] text-brand-text/50 uppercase font-black tracking-wider block font-ui">Single Unit</span>
                <span className="text-2xl font-black text-brand-primary font-mono leading-none">
                  {currentUnitPrice} <span className="text-xs">XAF</span>
                </span>
                <span className="text-[10px] text-brand-text/60 block mt-1">Based on toppings</span>
              </div>
              <div className="text-right border-l border-brand-text/10 pl-4">
                <span className="text-[10px] text-brand-text/50 uppercase font-black tracking-wider block font-ui">Grand Total</span>
                <span className="text-2xl font-black text-brand-text font-mono leading-none">
                  {currentTotalPrice} <span className="text-xs">XAF</span>
                </span>
                <span className="text-[10px] text-brand-text/60 block mt-1">For {quantity} servings</span>
              </div>
            </div>

            {/* 1. Topping Exclusions */}
            <div className="space-y-3 font-ui">
               <div className="flex justify-between items-center">
                 <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-text/70">Exclusions (Tap to remove)</h4>
                 <span className="text-[10px] text-brand-text/50">No extra charge</span>
               </div>
               <div className="flex flex-wrap gap-2">
                 {customizations.map((option) => {
                   const isSelected = selectedOptions.includes(option);
                   return (
                     <button 
                       key={option}
                       onClick={() => toggleOption(option)}
                       className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                         isSelected 
                           ? "bg-brand-text text-white border border-brand-text" 
                           : "bg-white border border-brand-text/20 text-brand-text/80 hover:border-brand-text/40"
                       }`}
                     >
                       <span className="flex items-center gap-1">
                         {isSelected ? <X size={12} strokeWidth={3} /> : <Check size={12} className="text-brand-primary" />}
                         {option}
                       </span>
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* 2. Independent Unit Quantity Increments for Compliments */}
            <div className="space-y-3">
               <div className="flex justify-between items-center font-ui">
                 <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-text/70">Accompanying Compliments</h4>
                 <span className="text-xs font-bold text-brand-primary">+500 XAF each</span>
               </div>
               
               <div className="grid sm:grid-cols-2 gap-3">
                 
                 {/* Zobo drink item */}
                 <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                   zoboQty > 0 ? "bg-brand-juice/10 border-brand-juice/60 ring-1 ring-brand-juice/20" : "bg-white border-brand-text/10"
                 }`}>
                   <div className="space-y-0.5">
                     <p className="font-bold text-xs text-brand-text">Zobo (Hibiscus Drink)</p>
                     <p className="text-[10px] text-brand-text/60 inline-flex items-center gap-1 text-brand-juice font-bold bg-brand-juice/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                       Fresh Juice Accents
                     </p>
                   </div>

                   <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-lg border border-brand-text/15 self-center">
                     <button 
                       onClick={() => { if (zoboQty > 0) setZoboQty(prev => prev - 1); }}
                       className="w-6 h-6 rounded flex items-center justify-center text-brand-text hover:bg-stone-100 cursor-pointer disabled:opacity-20"
                       disabled={zoboQty === 0}
                       title="Remove Zobo compliment"
                     >
                       <Minus size={11} strokeWidth={3} />
                     </button>
                     <span className="text-xs font-black text-brand-text w-4 text-center font-mono">{zoboQty}</span>
                     <button 
                       onClick={() => setZoboQty(prev => prev + 1)}
                       className="w-6 h-6 rounded flex items-center justify-center text-brand-text hover:bg-stone-100 cursor-pointer"
                     >
                       <Plus size={11} strokeWidth={3} />
                     </button>
                   </div>
                 </div>

                 {/* Fruit Juice Compliment item */}
                 <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                   fruitJuiceQty > 0 ? "bg-brand-accent-1/10 border-brand-accent-1/60 ring-1 ring-brand-accent-1/20" : "bg-white border-brand-text/10"
                 }`}>
                   <div className="space-y-0.5">
                     <p className="font-bold text-xs text-brand-text">Fresh Fruit Juice</p>
                     <p className="text-[10px] text-brand-text/60 inline-flex items-center gap-1 text-brand-accent-1 font-bold bg-brand-accent-1/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                       Saffron Citrus
                     </p>
                   </div>

                   <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-lg border border-brand-text/15 self-center">
                     <button 
                       onClick={() => { if (fruitJuiceQty > 0) setFruitJuiceQty(prev => prev - 1); }}
                       className="w-6 h-6 rounded flex items-center justify-center text-brand-text hover:bg-stone-100 cursor-pointer disabled:opacity-20"
                       disabled={fruitJuiceQty === 0}
                       title="Remove Fruit Juice compliment"
                     >
                       <Minus size={11} strokeWidth={3} />
                     </button>
                     <span className="text-xs font-black text-brand-text w-4 text-center font-mono">{fruitJuiceQty}</span>
                     <button 
                       onClick={() => setFruitJuiceQty(prev => prev + 1)}
                       className="w-6 h-6 rounded flex items-center justify-center text-brand-text hover:bg-stone-100 cursor-pointer"
                     >
                       <Plus size={11} strokeWidth={3} />
                     </button>
                   </div>
                 </div>

               </div>
            </div>

            {/* 3. Product Quantity Selector */}
            <div className="bg-brand-text/5 rounded-xl p-4 border border-brand-text/10 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-brand-text/70 block font-ui">Select Quantity</span>
                <span className="text-[11px] text-brand-text/60 mt-0.5 block">Minimum order count is 1 unit</span>
              </div>

              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-brand-text/15 shadow-sm">
                <button 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    quantity <= 1 
                      ? "text-brand-text/30 bg-stone-50 cursor-not-allowed" 
                      : "text-brand-text hover:bg-brand-bg hover:text-brand-primary active:scale-90 cursor-pointer"
                  }`}
                  title="Limit structure requires at least 1 unit"
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>
                <span className="text-base font-black text-brand-text w-8 text-center select-none font-mono">
                  {quantity}
                </span>
                <button 
                  onClick={incrementQuantity}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-text hover:bg-brand-bg hover:text-brand-primary active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* 4. Special Customization Notes */}
            <div className="space-y-2">
               <label htmlFor="active-notes" className="text-xs uppercase tracking-wider text-brand-text/70 font-semibold font-ui block">Special Preparations Note</label>
               <textarea 
                 id="active-notes"
                 rows={1.5}
                 value={noteText}
                 onChange={(e) => setNoteText(e.target.value)}
                 placeholder="E.g., Mild pepper, package Zobo separately, extra napkins..."
                 className="w-full px-3 py-2 text-xs rounded-xl border border-brand-text/15 bg-stone-50/50 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder-brand-text/40 font-sans"
               />
            </div>

            {/* Quick Action Block: Order Directly via WhatsApp OR Queue in Cart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-ui">
              <button 
                onClick={addToCart}
                className="w-full bg-brand-text hover:bg-brand-primary text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border border-transparent shadow-sm"
              >
                <ShoppingCart size={15} />
                <span>Add to Order Cart</span>
              </button>

              <a 
                href={buildInstantWhatsAppLink(activeProduct.name, quantity, activeProduct.basePrice, selectedOptions, zoboQty, fruitJuiceQty, noteText)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-brand-primary hover:bg-brand-accent-2 text-white py-3 px-4 rounded-xl font-extrabold text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-brand-primary/10"
              >
                <span>Order Now via WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

        {/* Other Products showcasing cards */}
        <div className="mt-16 space-y-6 font-ui">
           <h3 className="text-lg md:text-xl font-bold font-heading text-brand-text border-l-4 border-brand-primary pl-3">Our Standalone Menu Selections</h3>
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {products.map((item) => {
               return (
                 <div 
                   key={item.id} 
                   className={`bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between group ${
                     activeProduct.id === item.id 
                       ? "border-brand-primary shadow-md ring-1 ring-brand-primary/25" 
                       : "border-brand-text/10 shadow-sm hover:shadow-md"
                   }`}
                 >
                   <div>
                     <div className="relative h-44 overflow-hidden bg-stone-100">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-brand-primary">
                         {item.basePrice} XAF
                       </div>
                     </div>
                     <div className="p-4 space-y-2">
                       <p className="font-extrabold text-sm text-brand-text line-clamp-1">{item.name}</p>
                       <p className="text-[11px] text-brand-text/70 line-clamp-2 leading-relaxed font-sans">{item.description}</p>
                     </div>
                   </div>

                   <div className="p-4 pt-1 bg-stone-50/50 flex gap-1.5 font-ui">
                     <button 
                       onClick={() => handleProductSelection(item)}
                       className="flex-1 bg-white hover:bg-stone-100 text-brand-text border border-brand-text/10 py-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                     >
                       Customize
                     </button>
                     <a 
                       href={buildInstantWhatsAppLink(item.name, 1, item.basePrice, [], 0, 0, "")}
                       target="_blank"
                       rel="noreferrer"
                       className="bg-brand-primary hover:bg-brand-accent-2 text-white px-3 py-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-center"
                       title="Order 1 instantly on WhatsApp"
                     >
                       Instant Order
                     </a>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

      </section>

      {/* 4. Event & Catering Services Section */}
      <section id="catering" className="bg-brand-text text-stone-100 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Info Side showing all required event categories */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-1.5 bg-black/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-white/10 font-ui">
              <PartyPopper size={13} className="text-amber-400" />
              <span>Full-scale event catering in Buea</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold font-heading tracking-tight leading-none text-white" style={{ color: '#ffffff' }}>
              Catering Your Best <span className="text-amber-300 select-none" style={{ color: '#fbbf24' }}>Celebrations</span>
            </h2>

            <p className="text-stone-200 leading-relaxed text-sm md:text-base font-sans">
              DailyBread wraps bring premium flavors to your social gatherings! We fully bake, seasoned, grill, and deliver dynamic live stations or packaged party boxes across the South West region.
            </p>

            {/* List the custom services mandated */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2 font-ui">
              {[
                { name: "Family gatherings", desc: "Plentiful custom foil trays" },
                { name: "Hangouts & Get-togethers", desc: "Warm flatbread snack boards" },
                { name: "Birthday celebrations", desc: "Tailored child-friendly sizing" },
                { name: "Anniversaries & Romance", desc: "Luxury private couple menu" },
                { name: "Corporate events", desc: "Clean pre-packaged lunchboxes" },
                { name: "Private closed events", desc: "Private dynamic grill chef setups" },
                { name: "Dine-in seating eatery", desc: "Relax and sit with us in Bokwaongo!" }
              ].map((service, index) => (
                <div key={index} className="flex gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-brand-accent-1 font-extrabold mt-0.5 text-sm">✓</div>
                  <div>
                    <h4 className="font-bold text-xs !text-white leading-none" style={{ color: '#ffffff' }}>{service.name}</h4>
                    <p className="text-[10px] !text-stone-200 mt-1" style={{ color: '#e7e5e4' }}>{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-stone-900/30 p-4 rounded-xl border border-white/5 text-xs text-stone-300 flex items-center gap-3">
              <div className="text-2xl font-mono">🔥</div>
              <p className="font-sans leading-relaxed">
                Our chefs grill DailyBread shawarma behind protective glass enclosures, ensuring maximum hygiene. We combine top-quality ingredients with fresh, hand-selected vegetables for a safe, flavorful, and satisfying meal.
              </p>
            </div>
          </div>

          {/* Contact booking Form Side */}
          <div className="lg:col-span-6 bg-white text-brand-text p-6 md:p-8 rounded-3xl shadow-xl space-y-6 border border-brand-text/5">
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold font-heading text-brand-text">Fast Catering Inquiry</h3>
              <p className="text-xs text-brand-text/70 mt-1">Get an instant customized flatbread package proposal</p>
            </div>

            <form onSubmit={handleCateringBooking} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-brand-text/60 uppercase tracking-wider block mb-1">Your Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="E.g., John Doe" 
                  value={cateringForm.name}
                  onChange={(e) => setCateringForm({...cateringForm, name: e.target.value})}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-brand-text/60 uppercase tracking-wider block mb-1">WhatsApp Phone *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="E.g., +237 6XX XX XX XX" 
                    value={cateringForm.phone}
                    onChange={(e) => setCateringForm({...cateringForm, phone: e.target.value})}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-brand-text/60 uppercase tracking-wider block mb-1">Event Date</label>
                  <input 
                    type="date" 
                    placeholder="Check" 
                    value={cateringForm.date}
                    onChange={(e) => setCateringForm({...cateringForm, date: e.target.value})}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-brand-text/60 uppercase tracking-wider block mb-1">Event Theme</label>
                  <select 
                    value={cateringForm.eventType}
                    onChange={(e) => setCateringForm({...cateringForm, eventType: e.target.value})}
                    className="w-full bg-white border border-stone-200 rounded-xl px-2 py-2.5 text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  >
                    <option>Birthday Celebration</option>
                    <option>Anniversary dinner</option>
                    <option>Corporate Party</option>
                    <option>Closed Hangout</option>
                    <option>Family Reunion</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-brand-text/60 uppercase tracking-wider block mb-1">Guests Count</label>
                  <select 
                    value={cateringForm.guests}
                    onChange={(e) => setCateringForm({...cateringForm, guests: e.target.value})}
                    className="w-full bg-white border border-stone-200 rounded-xl px-2 py-2.5 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option>10-20 guests</option>
                    <option>20-50 guests</option>
                    <option>50-100 guests</option>
                    <option>100+ guests</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-brand-text/60 uppercase tracking-wider block mb-1">Special requests & Details</label>
                <textarea 
                  rows={2}
                  value={cateringForm.details}
                  onChange={(e) => setCateringForm({...cateringForm, details: e.target.value})}
                  placeholder="Need special vegetarian setups, extra Zobo trays, etc..."
                  className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none text-brand-text placeholder-brand-text/40"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-bold text-xs hover:bg-brand-accent-2 transition-colors shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer font-ui"
              >
                <Send size={14} />
                <span>Submit Inquiry via WhatsApp</span>
              </button>

              {cateringStatus && (
                <p className="text-center font-bold text-xs text-brand-primary bg-brand-primary/10 p-2.5 rounded-xl animate-pulse font-mono">
                  {cateringStatus}
                </p>
              )}
            </form>
          </div>

        </div>
      </section>

      {/* 5. About Us Section */}
      <section id="about" className="py-16 md:py-24 max-w-6xl mx-auto px-4 md:px-8 font-ui">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 relative">
            <div className="absolute -top-3 -left-3 w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center font-bold text-3xl">“</div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand-primary tracking-wider uppercase bg-brand-primary/10 px-3 py-1 rounded-md font-mono">Our Journey in Buea</span>
              <h2 className="text-3xl md:text-5xl font-bold font-heading text-brand-text tracking-tight leading-none">
                Baking Fresh Bread and Searing Spiced Beef Every Single Day
              </h2>
              <p className="text-brand-text/80 text-sm md:text-base leading-relaxed font-sans">
                Founded beside Bishop Store, DailyBread started with a singular golden mission: to elevate shawarma street food in Buea. Combining authentic Lebanese flatbread techniques with freshly crushed habaneros & local Cameroonian hibiscus juice (Zobo), we created an unparalleled food standard.
              </p>
              <p className="text-brand-text/80 text-sm leading-relaxed font-sans">
                We believe that premium food is prepared with complete honesty. That is why our beef rolls are purely lean muscle trimmed manually, spiced overnight, and roasted slowly with zero trans fats. One wrap keeps you full and fueled for the whole day!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-text/10 mt-6 md:mt-8 font-mono">
              <div className="text-center">
                <span className="block text-xl md:text-2xl font-black text-brand-primary">100%</span>
                <span className="text-[10px] text-brand-text/60 uppercase font-black tracking-wider">Natural Beef</span>
              </div>
              <div className="text-center border-x border-brand-text/10">
                <span className="block text-xl md:text-2xl font-black text-brand-primary">Daily</span>
                <span className="text-[10px] text-brand-text/60 uppercase font-black tracking-wider">Baked Pita</span>
              </div>
              <div className="text-center">
                <span className="block text-xl md:text-2xl font-black text-brand-primary">Local</span>
                <span className="text-[10px] text-brand-text/60 uppercase font-black tracking-wider">Zobo Drink</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-brand-primary/5 p-5 rounded-2xl border border-brand-primary/10">
                <div className="bg-brand-primary text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg mb-3">📍</div>
                <h4 className="font-semibold font-heading text-brand-text text-sm">Bokwaongo Junction</h4>
                <p className="text-[11px] text-brand-text/70 mt-1 font-sans leading-relaxed">Conveniently situated next to Bishop Store.</p>
              </div>
              <div className="bg-brand-text/5 p-5 rounded-2xl border border-brand-text/10">
                <div className="bg-brand-text text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg mb-3">🥖</div>
                <h4 className="font-semibold font-heading text-brand-text text-sm">Lebanese Flour</h4>
                <p className="text-[11px] text-brand-text/70 mt-1 font-sans leading-relaxed">Authentic durum flour wraps yielding optimal crunch when hot-grilled.</p>
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                <div className="bg-stone-800 text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg mb-3">🥬</div>
                <h4 className="font-semibold font-heading text-brand-text text-sm">Fresh Toppings</h4>
                <p className="text-[11px] text-brand-text/70 mt-1 font-sans leading-relaxed">Crisp locally sourced tomatoes, onions, & cucumber wedges harvested daily.</p>
              </div>
              <div className="bg-brand-accent-1/5 p-5 rounded-2xl border border-brand-accent-1/10">
                <div className="bg-brand-accent-1 text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg mb-3">🍹</div>
                <h4 className="font-semibold font-heading text-brand-text text-sm">Healthy pairings</h4>
                <p className="text-[11px] text-brand-text/70 mt-1 font-sans leading-relaxed">House-prepared cold sweet Zobo hibiscus extracts without preservatives.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Opening Hours & Live Status Validation Section */}
      <section id="hours" className="bg-gradient-to-tr from-[#080d1e] via-[#0d1631] to-[#1c2e5a] text-stone-100 py-16 md:py-20 border-y border-blue-950/45">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Working hours info */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black uppercase text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full tracking-wider border border-amber-400/20">
              Operating schedule validation
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
              Always Warm, Always <span className="text-amber-400">Ready</span> For You
            </h2>
            <p className="text-stone-200 text-sm leading-relaxed">
              We maintain steady baking shifts to serve you the crispest flatbread possible. Visit our physical Bokwaongo Junction store or trigger direct home deliveries on our WhatsApp helpline.
            </p>

            <div className="space-y-3.5 max-w-md pt-2 font-ui">
              <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="font-bold text-xs text-stone-200">Tuesday - Sunday (Working)</span>
                </div>
                <span className="font-mono text-xs text-brand-accent-1 font-bold">1:00 PM - 10:30 PM</span>
              </div>

              <div className="flex justify-between items-center bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                   <span className="font-bold text-xs text-stone-200">Monday (Off-Day)</span>
                </div>
                <span className="font-mono text-xs text-stone-400 font-bold">CLOSED</span>
              </div>
            </div>

            {/* Simulated environment state widget */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl max-w-sm space-y-2 shadow-lg">
               <h4 className="text-[10px] uppercase font-black tracking-wider text-stone-300 font-mono">Time-Zone Emulator</h4>
               <p className="text-xs text-stone-300 font-sans">
                 You are currently viewing from your local browser time. Test the dynamic status validator:
               </p>
               <div className="flex flex-wrap gap-1.5 pt-1 font-ui">
                 <button 
                   onClick={() => setSimulatedHour(12)} 
                   className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${simulatedHour === 12 ? 'bg-brand-accent-1 text-brand-text' : 'bg-white/10 hover:bg-white/15'}`}
                 >
                   ☀️ Set Lunch (12 PM)
                 </button>
                 <button 
                   onClick={() => setSimulatedHour(19)} 
                   className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${simulatedHour === 19 ? 'bg-brand-accent-1 text-brand-text' : 'bg-white/10 hover:bg-white/15'}`}
                 >
                   🌙 Set Dinner (7 PM)
                 </button>
                 <button 
                   onClick={() => setSimulatedHour(23)} 
                   className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${simulatedHour === 23 ? 'bg-brand-accent-1 text-brand-text' : 'bg-white/10 hover:bg-white/15'}`}
                 >
                   💤 Set Night (11 PM)
                 </button>
                 <button 
                   onClick={() => setSimulatedHour(null)} 
                   className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${simulatedHour === null ? 'bg-stone-850 text-white underline' : 'bg-white/10 hover:bg-white/15'}`}
                 >
                   🔄 Restore Live Clock
                 </button>
               </div>
            </div>
          </div>

          {/* Quick status display widget */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 max-w-md w-full space-y-6 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-xl"></div>
              
              <div className="inline-flex mx-auto w-16 h-16 bg-white/5 rounded-full items-center justify-center border border-white/10 shadow-xl">
                 <Clock className="text-brand-accent-1" size={28} />
              </div>

              <div className="space-y-1">
                 <p className="text-[11px] text-stone-300 font-bold uppercase tracking-widest font-mono">Dynamic Status Indicator</p>
                 <div className="flex items-center justify-center gap-2 font-heading">
                    <span className={`w-3.5 h-3.5 rounded-full ${isEateryOpen ? "bg-green-500 animate-ping" : "bg-red-500"}`}></span>
                    <span className="text-2xl font-black">{isEateryOpen ? "OPEN FOR ORDER" : "CLOSED NOW"}</span>
                 </div>
              </div>

              <p className="text-xs text-stone-300 max-w-sm mx-auto font-sans leading-relaxed">
                {isEateryOpen 
                  ? "Our grills at Bokwaongo Junction are active! Order fresh beef/chicken right now on WhatsApp." 
                  : "We are currently resting our grills to source fresh ingredients. Our team opens at 1:00 PM."
                }
              </p>

              <div className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 text-left space-y-2 font-mono shadow-inner">
                 <p className="text-[10px] font-black uppercase text-brand-accent-1 tracking-wider">Fast Contact Reference</p>
                 <p className="text-xs text-stone-200">💬 WhatsApp: {formattedPhoneDisplay}</p>
                 <p className="text-xs text-stone-200">📍 Location: beside Bishop Store, Bokwaongo Junction, Buea, Cameroon</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Testimonials Section */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 md:px-8 font-ui">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
           <span className="text-brand-primary text-xs font-bold uppercase tracking-wider bg-brand-primary/10 px-3 py-1 rounded-md font-mono">Verified Taste Opinions</span>
           <h2 className="text-3xl md:text-5xl font-bold font-heading text-brand-text tracking-tight">No Long Talk: The City Loves Our Taste!</h2>
           <p className="text-brand-text/70 text-sm font-sans">Hear what students from University of Buea and families around Great Soppo say about us</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "The soft Lebanese bread they grill in Buea is simply outstanding. The meat is spiced overnight, juicy, and never dry! Best shawarma near Bokwaongo Junction.",
              author: "Nchouta Divine",
              role: "Local tour guide, Buea",
              rating: 5
            },
            {
              quote: "I order the DailyBread Shawarma combined with an ice-cold Zobo drink almost every Wednesday during lessons. Quick delivery straight to Molyko campus over WhatsApp!",
              author: "Bessem Clara",
              role: "Student, University of Buea",
              rating: 5
            }
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-text/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                 <div className="flex gap-0.5 text-amber-500">
                   {[...Array(item.rating)].map((_, i) => (
                     <Star key={i} size={15} className="fill-amber-500" />
                   ))}
                 </div>
                 <p className="text-xs text-brand-text/85 leading-relaxed italic font-sans font-sans">
                   "{item.quote}"
                 </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className="bg-brand-text text-stone-100 rounded-full w-9 h-9 flex items-center justify-center font-bold text-xs font-mono">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-brand-text leading-none">{item.author}</h4>
                  <span className="text-[10px] text-brand-text/50 block mt-1">{item.role}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Light-version TikTok Video Opinion */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-text/10 flex flex-col justify-between h-full min-h-[350px]">
            <div className="flex-1 w-full rounded-xl overflow-hidden bg-stone-50 border border-stone-100 relative shadow-inner">
              <iframe
                id="tiktok-iframe"
                src="https://www.tiktok.com/embed/v2/7640124826530680082"
                className="w-full h-full border-0 rounded-xl animate-fade-in"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ minHeight: '260px' }}
                title="DailyBread Shawarma Community Review"
              />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded uppercase font-mono animate-pulse">🔥 Video</span>
                <span className="text-[10px] text-brand-text/60 font-sans font-medium">Customer Love</span>
              </div>
              <a 
                href="https://www.tiktok.com/@whomissb1is/video/7640124826530680082" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-brand-primary font-bold hover:underline font-sans flex items-center gap-0.5"
              >
                Watch on TikTok ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Location & Embedded Directions Map Section */}
      <section id="location" className="bg-brand-bg/55 border-t border-brand-text/10 py-16 md:py-24 font-ui">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Directions instructions info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
              <MapPin size={13} />
              <span>Bokwaongo Junction, Buea</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold font-heading text-brand-text tracking-tight leading-none">
              Visit our Eatery in Cameroon
            </h2>

            <p className="text-sm text-brand-text/80 leading-relaxed font-sans">
              We are situated precisely beside <span className="font-bold">Bishop Store, Bokwaongo Junction, Buea, Cameroon</span>. Accessible by taxi and motorcycle from all spots in Buea.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center shrink-0 border border-stone-100 text-xs">🚗</div>
                <div>
                   <h4 className="font-bold text-xs text-brand-text">By Taxi to Bokwaongo Junction</h4>
                   <p className="text-[11px] text-brand-text/70 mt-0.5 font-sans">Simply inform the driver you are stopping at Bokwaongo Junction, beside Bishop Store.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center shrink-0 border border-stone-100 text-xs font-bold text-brand-primary">M</div>
                <div>
                   <h4 className="font-bold text-xs text-brand-text">By Motorcycle (Okada)</h4>
                   <p className="text-[11px] text-brand-text/70 mt-0.5 font-sans">Drop right next to Bishop Store around the junction corner.</p>
                </div>
              </div>
            </div>

            {/* Mandated: prominent Get Directions button linked to Google Maps pin location */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a 
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="bg-brand-primary hover:bg-brand-accent-2 text-white px-8 py-4 rounded-xl font-bold text-sm text-center shadow-lg shadow-brand-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Map size={16} />
                <span>Get Driving Directions</span>
              </a>
              <a 
                href={`tel:${phoneNumber}`}
                className="bg-white hover:bg-brand-bg text-brand-text border border-brand-text/15 px-8 py-4 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone size={15} className="text-brand-primary" />
                <span>Call for Directions</span>
              </a>
            </div>
          </div>

          {/* Embedded Google Map iframe - satisfying "embedded Google Map" requirement */}
          <div className="lg:col-span-7">
            <div className="bg-white p-3 rounded-3xl shadow-xl border border-brand-text/10 overflow-hidden relative">
              <div className="h-96 md:h-[450px] w-full rounded-2xl overflow-hidden relative isolate">
                
                <iframe 
                  title="DailyBread Bokwaongo Junction Location Map"
                  src="https://maps.google.com/maps?q=Bokwaongo%20Junction,%20Buea&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 rounded-2xl relative z-10" 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                
                {/* Fallback load screen indicator */}
                <div className="absolute inset-0 bg-stone-100 flex items-center justify-center -z-10">
                   <div className="text-center space-y-2">
                     <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full mx-auto"></div>
                     <p className="text-xs text-brand-text/60 font-sans">Generating Bokwaongo coordinate grid...</p>
                   </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-stone-100 flex justify-between items-center z-20">
                <div>
                   <p className="text-[10px] uppercase font-black tracking-widest text-brand-primary font-mono">Location Pin</p>
                   <p className="text-xs font-bold text-brand-text font-serif">{addressDisplay}</p>
                </div>
                <a 
                  href={mapsLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-brand-primary hover:bg-brand-accent-2 text-white p-2.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-brand-primary/25 cursor-pointer"
                >
                  NAVIGATE
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. FAQ Section (SEO FAQ Optimize Block) */}
      <section className="bg-white py-16 md:py-24 border-t border-brand-text/5 font-sans" id="faq">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/25 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider font-ui">
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-brand-text tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-brand-text/70 max-w-xl mx-auto text-sm leading-relaxed">
              Find fast answers to common questions about our freshly made shawarma wraps, quick home delivery in Buea, dynamic WhatsApp orders, and Zobo juices.
            </p>
          </div>

          <div className="space-y-4 font-ui">
            
            <div className="bg-stone-50 border border-brand-text/5 rounded-2xl p-6 transition-all hover:shadow-md">
              <h3 className="text-base font-bold text-brand-text flex items-start gap-3">
                <span className="text-brand-primary font-mono font-bold shrink-0">01.</span>
                <span>Where can I get the best beef shawarma in Buea?</span>
              </h3>
              <p className="mt-2 text-sm text-brand-text/75 pl-8 leading-relaxed font-sans">
                You can get the best freshly prepared beef shawarma right at <strong className="text-brand-primary">DailyBread Shawarma</strong>, located beside Bishop Store at Bokwaongo Junction, Buea, Cameroon. We slow-grill premium cuts of beef and roll them with organic ingredients inside clean toasted Lebanese flatbread.
              </p>
            </div>

            <div className="bg-stone-50 border border-brand-text/5 rounded-2xl p-6 transition-all hover:shadow-md">
              <h3 className="text-base font-bold text-brand-text flex items-start gap-3">
                <span className="text-brand-primary font-mono font-bold shrink-0">02.</span>
                <span>Do you offer food delivery in Buea?</span>
              </h3>
              <p className="mt-2 text-sm text-brand-text/75 pl-8 leading-relaxed font-sans">
                Yes, we offer fast food delivery across major areas in Buea, Cameroon. Your warm shawarma rolls and signature chilled beverages are packaged in highly hygienic wrap containers and dispatched immediately from Bokwaongo.
              </p>
            </div>

            <div className="bg-stone-50 border border-brand-text/5 rounded-2xl p-6 transition-all hover:shadow-md">
              <h3 className="text-base font-bold text-brand-text flex items-start gap-3">
                <span className="text-brand-primary font-mono font-bold shrink-0">03.</span>
                <span>Can I order through WhatsApp?</span>
              </h3>
              <p className="mt-2 text-sm text-brand-text/75 pl-8 leading-relaxed font-sans">
                Absolutely! Our web platform features an custom interactive order cart. You can build your favorite shawarma, click "Order on WhatsApp", and complete your payment details and delivery coordination through our direct WhatsApp channel.
              </p>
            </div>

            <div className="bg-stone-50 border border-brand-text/5 rounded-2xl p-6 transition-all hover:shadow-md">
              <h3 className="text-base font-bold text-brand-text flex items-start gap-3">
                <span className="text-brand-primary font-mono font-bold shrink-0">04.</span>
                <span>Do you serve fresh juices and Zobo drinks?</span>
              </h3>
              <p className="mt-2 text-sm text-brand-text/75 pl-8 leading-relaxed font-sans">
                Yes, we serve home-brewed Cameroonian Zobo drinks (deliciously spiced hibiscus tea syrup) and organic, freshly squeezed seasonal fruit juices with no synthetic additives to pair beautifully with your meal.
              </p>
            </div>

            <div className="bg-stone-50 border border-brand-text/5 rounded-2xl p-6 transition-all hover:shadow-md">
              <h3 className="text-base font-bold text-brand-text flex items-start gap-3">
                <span className="text-brand-primary font-mono font-bold shrink-0">05.</span>
                <span>How can I view your menu?</span>
              </h3>
              <p className="mt-2 text-sm text-brand-text/75 pl-8 leading-relaxed font-sans">
                Our dynamic digital menu is listed directly on this page. For an incredible modern preview, you can click on items to view them with our realistic, interactive 3D WebAR graphics screen that helps you see your portion and wrap selections.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9.5. Contact & Click-To-Call Support Block */}
      <section className="bg-[#0a0a0c] text-white py-16 md:py-20 border-t border-stone-900 font-ui">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-amber-400">
             <Phone size={24} />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-white tracking-tight">Need Support or Party Booking?</h2>
          <p className="text-stone-200 max-w-lg mx-auto text-sm leading-relaxed font-sans">
            Our local support call operators are active Tue - Sun to handle customized meal counts, fast delivery routing, or catering package adjustments.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            {/* Click-to-call Customer Support Phone link */}
            <a 
              href={`tel:${phoneNumber}`} 
              className="w-full sm:w-auto bg-brand-accent-1 hover:bg-brand-primary text-brand-text hover:text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-brand-accent-1/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 text-base cursor-pointer"
            >
              <Phone size={18} strokeWidth={2.5} />
              <span>Call Us: {formattedPhoneDisplay}</span>
            </a>
            
            <a 
              href={`https://wa.me/237652351693`} 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 text-base cursor-pointer"
            >
              <span>Quick WhatsApp chat</span>
            </a>
          </div>

          <p className="text-[10px] text-stone-400 font-sans">
            For walk-ins, we have secure motorcycle parking and highly hygienic handwashing counters.
          </p>
        </div>
      </section>

      {/* 10. Footers */}
      <footer className="bg-stone-950 text-stone-300 py-12 border-t border-stone-900 text-xs font-ui">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
             <h4 className="font-extrabold font-heading text-amber-400 text-sm tracking-widest uppercase mb-1">DailyBread</h4>
             <p className="text-stone-300 text-[11px] leading-relaxed">
               Crafting premium middle-eastern flavor wraps designed with rich local ingredients in South West Cameroon.
             </p>
             <p className="text-amber-400 font-bold">📍 beside Bishop Store, Bokwaongo Junction, Buea</p>
          </div>

          <div className="space-y-2">
             <h4 className="font-extrabold text-stone-100 text-xs uppercase tracking-widest mb-1">Quick Actions</h4>
             <ul className="space-y-1.5 text-stone-300">
               <li><a href="#menu" className="hover:text-amber-400 transition-colors">Beef Shawarma Customizer</a></li>
               <li><a href="#catering" className="hover:text-amber-400 transition-colors">Event & Catering Services</a></li>
               <li><a href="#about" className="hover:text-amber-400 transition-colors">About DailyBread Studio</a></li>
               <li><a href="#location" className="hover:text-amber-400 transition-colors">Google Maps Directions</a></li>
             </ul>
          </div>

          <div className="space-y-2">
             <h4 className="font-extrabold text-stone-100 text-xs uppercase tracking-widest mb-1">Catering categories</h4>
             <ul className="space-y-1.5 text-stone-300">
               <li>• Anniversaries & Romance</li>
               <li>• Birthday celebrations</li>
               <li>• Corporate workshops</li>
               <li>• Family home meals</li>
               <li>• Dine-in seating in Buea</li>
              </ul>
          </div>

          <div className="space-y-3">
             <h4 className="font-extrabold text-stone-100 text-xs uppercase tracking-widest mb-1">Help Desk & Hotline</h4>
             {/* Telephone support displayed in footer */}
             <p className="text-stone-200 font-mono text-xs">📞 Tel: {formattedPhoneDisplay}</p>
             <p className="text-stone-300">✉ Email: contact@dailybreadshawarma.store</p>
             <p className="text-[10px] text-stone-400 leading-normal">
               Call directly on your mobile device for rapid resolution. Safe, hygienic takeaway packaging standard.
             </p>
          </div>

        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 mt-8 border-t border-stone-900 text-center text-stone-500 flex flex-col sm:flex-row justify-center items-center gap-4">
           <p>© 2026 DailyBread Shawarma. All rights reserved. Made originally for Buea, Cameroon.</p>
        </div>
      </footer>

      {/* Cart Slider Drawer Component */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-container">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-brand-bg shadow-2xl flex flex-col h-full rounded-l-3xl border-l border-brand-text/10 animate-in slide-in-from-right duration-200">
              
              <div className="px-6 py-5 border-b border-brand-text/10 bg-white rounded-tl-3xl flex items-center justify-between font-ui">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-brand-primary" size={20} />
                  <h2 className="text-lg font-bold font-heading text-brand-text">Order Cart ({totalCartQuantity})</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-text/75 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

               <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 font-ui">
                {showCheckoutSuccess ? (
                  <div className="text-center py-12 px-4 space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-sm border border-green-200">
                      <Check size={32} strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl font-bold font-heading text-brand-text">Order Active!</h3>
                    <p className="text-sm text-brand-text/70 max-w-sm mx-auto leading-relaxed font-sans">
                      We have generated your custom wrap payload. You will be redirected to complete payment & delivery details on our support channel.
                    </p>
                    <button 
                      onClick={() => {
                        setShowCheckoutSuccess(false);
                        setIsCartOpen(false);
                      }}
                      className="mt-6 px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-accent-2 transition-colors cursor-pointer text-xs"
                    >
                      Return to Menu
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 bg-brand-text/5 rounded-full flex items-center justify-center mx-auto text-brand-text/30 border border-brand-text/5">
                      <ShoppingCart size={24} />
                    </div>
                    <p className="text-brand-text/70 font-bold font-sans">Your order cart is empty.</p>
                    <p className="text-xs text-brand-text/50 max-w-xs mx-auto leading-normal font-sans">
                      Go ahead and customize our flagship DailyBread Shawarma, add some fresh Zobo, then review details here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-2xl border border-brand-text/10 flex justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="space-y-1.5 w-full min-w-0">
                          <h4 className="font-bold text-sm text-brand-text leading-snug">{item.name}</h4>
                          <p className="text-xs text-stone-500 font-mono">Qty: {item.quantity} × {item.unitPrice} XAF</p>
                          
                          {item.options.length > 0 && (
                            <div className="text-[11px] text-brand-text/80 bg-stone-50 px-2 py-0.5 rounded border border-stone-200 mt-1 inline-block font-sans">
                              <span className="font-bold">🚫 Exclude:</span> {item.options.join(', ')}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.zoboQty > 0 && (
                              <span className="inline-block text-[10px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded border border-brand-primary/10 font-mono">
                                + Zobo Drink (x{item.zoboQty})
                              </span>
                            )}
                            {item.fruitJuiceQty > 0 && (
                              <span className="inline-block text-[10px] bg-brand-juice/10 text-brand-text font-bold px-2 py-0.5 rounded border border-brand-juice/10 font-mono">
                                + Fruit Juice (x{item.fruitJuiceQty})
                              </span>
                            )}
                          </div>
                          
                          {item.noteText && (
                            <div className="text-[11px] text-brand-text/85 bg-brand-accent-1/5 p-2 rounded-lg border border-brand-accent-1/10 mt-2 flex items-start gap-1.5">
                              <MessageSquare size={11} className="mt-0.5 shrink-0 text-brand-primary" />
                              <span className="break-words w-full font-sans">"{item.noteText}"</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col justify-between items-end shrink-0 font-mono">
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="p-1.5 text-brand-text/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove item from order cart"
                          >
                            <Trash2 size={14} />
                          </button>
                          <span className="font-bold text-sm text-brand-primary">{item.totalPrice} XAF</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!showCheckoutSuccess && cart.length > 0 && (
                <div className="px-6 py-6 border-t border-brand-text/10 bg-white rounded-b-3xl space-y-4 shadow-xl font-ui">
                  <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <span className="font-bold text-xs text-brand-text/70 uppercase font-mono">Order Grand Total:</span>
                    <span className="text-xl font-bold text-brand-primary font-mono">{totalCartPrice} XAF</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCart([]);
                        setIsCartOpen(false);
                      }}
                      className="py-3 px-3 border border-brand-text/20 text-brand-text rounded-xl font-bold text-xs hover:bg-brand-primary/10 text-center cursor-pointer transition-colors font-sans"
                    >
                      Clear Cart
                    </button>
                    
                    <a 
                      href={buildCartWhatsAppRequest()}
                      onClick={handleCheckout}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 px-3 bg-brand-primary hover:bg-brand-accent-2 text-white font-bold rounded-xl shadow-md text-xs text-center flex items-center justify-center gap-1 cursor-pointer transition-colors font-sans"
                    >
                      <Send size={12} />
                      <span>Order on WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 11. Sticky WhatsApp & Click-to-Call Buttons for mobile overlay */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-brand-text/10 p-3 flex sm:hidden justify-between items-center gap-3 z-30 shadow-2xl font-ui">
         
         {/* Mobile Click-to-Call direct anchor link */}
         <a 
           href={`tel:${phoneNumber}`} 
           className="flex-1 bg-brand-text hover:bg-brand-text/90 text-white py-3.5 px-2 rounded-xl text-xs font-bold tracking-wide text-center flex items-center justify-center gap-2 cursor-pointer"
           title="Tap to Call Support Directly"
         >
           <Phone size={15} />
           <span>📞 Call Us</span>
         </a>

         {/* Sticky WhatsApp Chat CTA */}
         <a 
           href={`https://wa.me/237652351693`} 
           target="_blank" 
           rel="noreferrer"
           className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 px-2 rounded-xl text-xs font-bold tracking-wide text-center flex items-center justify-center gap-2 shadow-lg cursor-pointer"
           title="Open live chat on WhatsApp"
         >
           <span>💬 WhatsApp Order</span>
         </a>

      </div>

    </div>
  );
}
