"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCIES, FEE_STRUCTURE, CURRENCY_CONVERSION_MARKUP, type Currency, type FeeTier } from "@/lib/constants";
import { RotateCw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  amount: z.coerce.number({invalid_type_error: "Please enter a valid amount."}).positive({ message: "Please enter a positive amount." }).min(1, "Amount must be at least 1.").max(9999999, { message: "Amount must be 7 digits or less." }),
  currency: z.string().min(1, { message: "Please select a currency." }),
  feeTier: z.string().min(1, { message: "Please select a fee rate." }),
});

type CalculationResult = {
  currency: Currency | null;
  paypalFee: number;
  fixedFee: number;
  currencyConversionFee: number;
  finalAmountInINR: number;
  karbonPayout: number;
  paypalFeeInSelectedCurrency: number;
  fixedFeeInSelectedCurrency: number;
};

const formatCurrency = (amount: number, currencyCode: string) => {
    const amountFormatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
    return `${amountFormatted} ${currencyCode}`;
};


const initialResultState: CalculationResult = {
    currency: null,
    paypalFee: 0,
    fixedFee: 0,
    currencyConversionFee: 0,
    finalAmountInINR: 0,
    karbonPayout: 0,
    paypalFeeInSelectedCurrency: 0,
    fixedFeeInSelectedCurrency: 0,
};

export default function FeeCalculator({ initialRates }: { initialRates: { [key: string]: number } }) {
  const [results, setResults] = useState<CalculationResult>(initialResultState);
  const [availableFeeTiers, setAvailableFeeTiers] = useState<FeeTier[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    if (initialRates && Object.keys(initialRates).length > 0) {
      // The API returns rates showing how many of other currencies 1 INR can buy.
      // We need the inverse: how many INR 1 unit of the other currency can buy.
      const ratesToInr = Object.keys(initialRates).reduce((acc, key) => {
          if (initialRates[key] !== 0) {
            acc[key] = 1 / initialRates[key];
          }
          return acc;
      }, {} as {[key: string]: number});
      // Add INR rate as 1 since it's the base currency
      ratesToInr['INR'] = 1;
      setExchangeRates(ratesToInr);
    } else if (initialRates) {
        // Handle case where API might be down but we still want INR to work
        setExchangeRates({ 'INR': 1 });
    }
  }, [initialRates]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      currency: "",
      feeTier: "",
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const watchedCurrency = useWatch({ control: form.control, name: 'currency' });

  const runCalculation = (values: z.infer<typeof formSchema>) => {
    const { amount, currency: currencyCode, feeTier: feeTierId } = values;

    if (!amount || !currencyCode) {
        setIsCalculated(false);
        setResults(initialResultState);
        return;
    }
    
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (!currency) return;

    const feeTiers = FEE_STRUCTURE[currency.code] || [];
    const selectedTier = feeTiers.find(tier => tier.id === feeTierId) || feeTiers.find(tier => {
      const numericAmount = Number(amount);
      const min = tier.minAmount ?? -Infinity;
      const max = tier.maxAmount ?? Infinity;
      return numericAmount >= min && numericAmount <= max;
    }) || (feeTiers.length > 0 ? feeTiers[0] : undefined);
    
    if (!selectedTier) return;
    
    const interbankRate = exchangeRates[currencyCode];
    if (currencyCode !== 'INR' && !interbankRate) {
        console.error(`Exchange rate for ${currencyCode} not available.`);
        // Maybe show a toast message to the user
        return;
    };

    const amountInNumber = Number(amount);
    
    const paypalPercentageFee = amountInNumber * (selectedTier.percentage / 100);
    const paypalFixedFee = currency.fixedFee;

    const amountAfterFees = amountInNumber - paypalPercentageFee - paypalFixedFee;
    
    const effectiveInterbankRate = interbankRate || 1;
    
    // Karbon Payout Calculation
    const karbonInitialInr = amountInNumber * effectiveInterbankRate;
    const karbonFee = karbonInitialInr * 0.01; // 1% Karbon fee
    const gstOnFee = karbonFee * 0.18; // 18% GST on the fee
    const karbonPayout = karbonInitialInr - karbonFee - gstOnFee;


    let finalAmountInINR = 0;
    let currencyConversionFee = 0;
    let paypalFeeInr = 0;
    let fixedFeeInr = 0;
    
    if (currency.code === 'INR') {
        finalAmountInINR = amountAfterFees;
        paypalFeeInr = paypalPercentageFee;
        fixedFeeInr = paypalFixedFee;
    } else {
        const markedUpRate = effectiveInterbankRate * (1 - CURRENCY_CONVERSION_MARKUP);
        finalAmountInINR = amountAfterFees * markedUpRate;
        currencyConversionFee = (amountAfterFees * effectiveInterbankRate) - finalAmountInINR;
        paypalFeeInr = paypalPercentageFee * effectiveInterbankRate;
        fixedFeeInr = paypalFixedFee * effectiveInterbankRate;
    }
    
    setResults({
      currency,
      paypalFee: paypalFeeInr,
      fixedFee: fixedFeeInr,
      currencyConversionFee,
      finalAmountInINR,
      karbonPayout,
      paypalFeeInSelectedCurrency: paypalPercentageFee,
      fixedFeeInSelectedCurrency: paypalFixedFee,
    });
    setIsCalculated(true);
  };
  
  useEffect(() => {
    if (watchedCurrency) {
      const tiers = FEE_STRUCTURE[watchedCurrency] || [];
      const currency = CURRENCIES.find(c => c.code === watchedCurrency);
      
      // Use currency code for specific currencies, otherwise symbol
      const symbol = ['CAD', 'SGD', 'AUD'].includes(currency?.code || '') ? (currency?.code + ' ') : currency?.symbol;
      
      setAvailableFeeTiers(tiers.map(tier => ({
          ...tier,
          name: tier.name
            .replace(/{symbol}/g, symbol || '')
            .replace(/{fixedFee}/g, currency?.fixedFee.toFixed(2) || '')
      })));
      
      let matchingTier: FeeTier | undefined;
      if (tiers.length > 0) {
        matchingTier = tiers[0];
      }
      form.setValue('feeTier', matchingTier?.id || (tiers.length > 0 ? tiers[0].id : ''));
    } else {
      setAvailableFeeTiers([]);
      form.setValue('feeTier', '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCurrency]);


  function handleReset() {
    form.reset({
      amount: undefined,
      currency: "",
      feeTier: "",
    });
    setResults(initialResultState);
    setIsCalculated(false);
  }
  
  return (
    <TooltipProvider>
      <Card className="w-full border-2 border-primary/10 rounded-2xl bg-[#F7FAFF]">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(runCalculation)} className="space-y-6">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel className="flex items-center gap-1.5 font-normal" style={{color: '#617283'}}>
                        Client Pays
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger>
                                <Info className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>The total amount the client will pay.</p>
                            </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount" {...field} value={field.value ?? ''} step="0.01" className="bg-white h-10 text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 font-normal" style={{color: '#617283'}}>
                        Currency (region)
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger>
                                <Info className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>The currency of the payment.</p>
                            </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white h-10 text-sm">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="feeTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 font-normal" style={{color: '#617283'}}>
                        Paypal Fee Rate
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger>
                                <Info className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Select the applicable PayPal fee structure.</p>
                            </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={availableFeeTiers.length <= 1}>
                        <FormControl>
                          <SelectTrigger className="bg-white h-10 text-sm data-[placeholder]:text-muted-foreground/50" disabled={availableFeeTiers.length <= 1}>
                            <SelectValue placeholder="Select fee tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableFeeTiers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" size="lg" className="flex-1 text-base font-medium" style={{ backgroundColor: '#0657D0' }}>
                  Calculate
                </Button>
                <Button type="button" variant="outline" size="lg" className="w-full sm:w-24 font-medium bg-white hover:bg-secondary hover:text-secondary-foreground" onClick={handleReset}>
                  <RotateCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </form>
          </Form>
          
           <div className="mt-6 border rounded-xl p-4">
              <div className="space-y-3">
                  <ResultRow 
                      label="Paypal fee:" 
                      value={
                          results.currency?.code === 'INR' 
                          ? formatCurrency(results.paypalFee, 'INR') 
                          : formatCurrency(results.paypalFeeInSelectedCurrency, results.currency?.code || 'USD')
                      } 
                  />
                  <ResultRow 
                      label="Fixed fee:" 
                      value={
                          results.currency?.code === 'INR' 
                          ? formatCurrency(results.fixedFee, 'INR') 
                          : formatCurrency(results.fixedFeeInSelectedCurrency, results.currency?.code || 'USD')
                      } 
                  />
                  <ResultRow 
                      label="Currency conversion fee (4%):" 
                      value={
                          results.currency?.code === 'INR'
                          ? formatCurrency(0, 'INR')
                          : formatCurrency(results.currencyConversionFee / (exchangeRates[results.currency?.code || 'USD'] || 1), results.currency?.code || 'USD')
                      }
                  />
              </div>
              <Separator className="my-4" />
              <div className="p-4 rounded-xl bg-[#F1F5F9] flex justify-between items-center">
                  <span className="font-bold text-lg text-destructive">You Receive</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`final-amount-${results.finalAmountInINR}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="font-bold text-xl text-destructive"
                    >
                      {formatCurrency(results.finalAmountInINR, 'INR')}
                    </motion.span>
                  </AnimatePresence>
              </div>
               <div className="mt-4 p-4 rounded-xl bg-[#E6F5F2] text-center">
                  <p className="font-bold text-lg" style={{color: '#00695C'}}>
                      You receive{' '}
                      <AnimatePresence mode="wait">
                          <motion.span
                            key={`karbon-payout-${results.karbonPayout}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            className="inline-block"
                          >
                            {formatCurrency(results.karbonPayout, 'INR')}
                          </motion.span>
                      </AnimatePresence>
                      {' '}with Karbon!
                  </p>
                  <p className="text-sm font-medium" style={{color: '#006054'}}>
                    <AnimatePresence mode="wait">
                        <motion.span
                          key={`karbon-diff-${results.karbonPayout - results.finalAmountInINR}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                          className="inline-block"
                        >
                          {
                            isCalculated 
                            ? `${formatCurrency(results.karbonPayout - results.finalAmountInINR, 'INR')} more in your account` 
                            : `${formatCurrency(0, 'INR')} more in your account`
                          }
                        </motion.span>
                    </AnimatePresence>
                  </p>
              </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

const ResultRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-foreground">{value}</span>
    </div>
);
