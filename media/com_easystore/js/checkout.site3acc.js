document.addEventListener('alpine:init',()=>{const base=Joomla.getOptions('easystore.base');const endpoints={information:`${base}/index.php?option=com_easystore&task=checkout.getInformation`,shipping:`${base}/index.php?option=com_easystore&task=checkout.getShipping`,payment_methods:`${base}/index.php?option=com_easystore&task=checkout.getPaymentMethods`,cart_data:`${base}/index.php?option=com_easystore&task=checkout.getCartData`,countries:`${base}/index.php?option=com_easystore&task=checkout.getCountries`,states:`${base}/index.php?option=com_easystore&task=checkout.getStates`,settings:`${base}/index.php?option=com_easystore&task=checkout.getCheckoutSettings`,search_guest_user:`${base}/index.php?option=com_easystore&task=checkout.searchGuestUser`,};Alpine.data('easystore_checkout',()=>{return{async init(){await this.loadData();this.updateOnShippingChange();this.$watch('coupon.code',()=>{this.coupon.message='';});this.$watch('information.shipping_address.country',async country=>{const states=await this.loadStates(country);this.shipping_states=states;this.updateCartData(this.active_shipping,this.information.shipping_address.country);this.updateShipping(country,this.information.shipping_address.state??null);});this.$watch('information.billing_address.country',async country=>{const states=await this.loadStates(country);this.billing_states=states;});this.$watch('information.shipping_address.state',async state=>{this.updateCartData(this.active_shipping,this.information.shipping_address.country,state);this.updateShipping(this.information.shipping_address.country,state);});this.$watch('active_shipping',async shippingId=>{this.updateCartData(shippingId,this.information.shipping_address.country,this.information.shipping_address.state);});},loading:false,searchLoading:false,settings:{},coupon:{showCouponInput:false,code:'',message:'',},legal:{terms_and_conditions:false,privacy_policy:false,},cart:{},information:{name:'',phone:'',is_billing_and_shipping_address_same:true,shipping_address:{},billing_address:{},save_guest_shipping:false,},shipping:[],payments:[],urls:{shipping:'',information:'',payment:'',},active_shipping:null,shipping_method:{},payment_method:'',countries:[],shipping_states:[],billing_states:[],get isDisabledPayButton(){return((this.settings.show_terms_and_conditions&&!this.legal.terms_and_conditions)||(this.settings.show_privacy_policy&&!this.legal.privacy_policy));},get address(){if(!this.information.shipping_address){return '-';}
const shippingAddress=this.information.shipping_address;return[shippingAddress.address,shippingAddress.city,shippingAddress.state,shippingAddress.country].filter(item=>!!item).map(item=>`<span>${item}</span>`).join(' ');},async searchGuestUser(event){const value=event.target.value;if(!value){return;}
this.searchLoading=true;const url=`${endpoints.search_guest_user}&email=${value}`;const response=await fetch(url);const data=await response.json();this.searchLoading=false;if(!!data.data){this.information={...this.information,shipping_address:data.data};}},async loadInformation(){const response=await fetch(endpoints.information);return(await response.json())?.data;},async loadShipping(country=null,state=null){const url=`${endpoints.shipping}&country=${country}&state=${state}&subtotal=${this.cart.sub_total??null}`;const response=await fetch(url);return(await response.json())?.data;},async loadPaymentMethods(){const response=await fetch(endpoints.payment_methods);return(await response.json())?.data;},async loadCartData(shippingId=null,country=null,state=null){const url=[{key:'shipping_id',value:shippingId},{key:'country',value:country},{key:'state',value:state},].reduce((url,param)=>{if(param.value){url+=`&${param.key}=${param.value}`;}
return url;},endpoints.cart_data);const response=await fetch(url);return(await response.json())?.data;},async loadCountries(){const response=await fetch(endpoints.countries);return(await response.json())?.data;},async loadStates(countryCode){const url=`${endpoints.states}&country_code=${countryCode??null}`;const response=await fetch(url);return(await response.json())?.data;},async loadSettings(){const response=await fetch(endpoints.settings);return(await response.json())?.data;},async loadData(){this.loading=true;const countries=await this.loadCountries();this.countries=countries?[...countries]:this.countries;const[information,shipping,payments,cart,settings]=await Promise.all([this.loadInformation(),this.loadShipping(),this.loadPaymentMethods(),this.loadCartData(),this.loadSettings(),]);this.loading=false;this.settings=settings?{...settings}:this.settings;this.information=information?{...information}:this.information;if(!this.information.shipping_address){this.information.shipping_address={};}
if(!this.information.billing_address){this.information.billing_address={};}
this.cart=cart?{...cart}:this.cart;this.shipping=shipping?[...shipping]:this.shipping;this.payments=payments?[...payments]:this.payments;this.payment_method=!!this.cart.payment_method?this.cart.payment_method:this.payments?.[0]?.name;if(this.information.shipping_address?.country){this.shipping_states=await this.loadStates(this.information.shipping_address.country);}
if(this.information.billing_address?.country){this.billing_states=await this.loadStates(this.information.billing_address.country);}
this.updateShipping(information?.shipping_address?.country??null,information?.shipping_address?.state??null,cart.sub_total);},async updateCartData(shippingId=null,country=null,state=null){this.loading=true;const cart=await this.loadCartData(shippingId,country,state);this.cart=cart?{...cart}:this.cart;this.loading=false;},async updateShipping(country=null,state=null){this.loading=true;const shipping=await this.loadShipping(country,state);this.shipping=shipping?[...shipping]:this.shipping;this.loading=false;},handleAddPromotionClick(){this.coupon.showCouponInput=true;this.$nextTick(()=>{this.$refs.couponInput.focus();});},handleCouponInputOutsideClick(){if(this.coupon.code.length>0){return;}
this.coupon.showCouponInput=false;},updateOnShippingChange(){if(!this.$refs.shippingMethod){return;}
const radioButtons=this.$refs.shippingMethod.querySelectorAll('input[type=radio]');if(!radioButtons){return;}
radioButtons.forEach(button=>{button.addEventListener('change',event=>{value=JSON.parse(event.target.value);this.active_shipping=value.uuid;});});},async applyCouponCode(event){event.preventDefault();this.loading=true;if(!this.coupon.code){this.coupon.message='The code is required';this.loading=false;return;}
const response=await fetch(`${Joomla.getOptions('easystore.base')}/index.php?option=com_easystore&task=checkout.applyCoupon&code=${
this.coupon.code
}&cart_id=${this.cart.id}`);const data=await response.json();if(data.data.message){this.coupon.message=data.data.message;this.loading=false;return;}
if(data.data.success){this.coupon.showCouponInput=false;this.coupon.code='';await this.updateCartData();return;}},async removeCouponCode(){const response=await fetch(`${Joomla.getOptions('easystore.base')}/index.php?option=com_easystore&task=checkout.removeCode&cart_id=${
this.cart.id
}`);const data=await response.json();if(data.data.success){await this.updateCartData();}
this.coupon.code='';},async onSubmitPayment(event){const formData=new FormData(event.target);if(!formData.get('is_billing_and_shipping_address_same')){formData.set('is_billing_and_shipping_address_same',0);}else{formData.set('is_billing_and_shipping_address_same',1);}
const shipping_address={name:formData.get('shipping_customer_name')??'',country:formData.get('shipping_country')??'',state:formData.get('shipping_state')??'',city:formData.get('shipping_city')??'',zip_code:formData.get('shipping_zip_code')??'',address_1:formData.get('shipping_address_line_1')??'',address_2:formData.get('shipping_address_line_2')??'',phone:formData.get('shipping_phone')??'',};const billing_address={name:formData.get('billing_customer_name')??'',country:formData.get('billing_country')??'',state:formData.get('billing_state')??'',city:formData.get('billing_city')??'',zip_code:formData.get('billing_zip_code')??'',address_1:formData.get('billing_address_line_1')??'',address_2:formData.get('billing_address_line_2')??'',phone:formData.get('billing_phone')??'',};for(const key of['country','state','city','zip_code','address_line_1','address_line_2','customer_name','phone',]){const shippingKey=`shipping_${key}`;const billingKey=`billing_${key}`;if(formData.has(shippingKey)){formData.delete(shippingKey);}
if(formData.has(billingKey)){formData.delete(billingKey);}}
formData.append('shipping_address',JSON.stringify(shipping_address));formData.append('billing_address',JSON.stringify(billing_address));this.loading=true;const response=await Joomla.request({url:`${base}/index.php?option=com_easystore&task=checkout.placeOrder`,data:formData,method:'POST',perform:true,promise:true,});const data=JSON.parse(response.response);this.loading=false;if(!data.data){return;}
if(!!data.data.redirectionUrl){window.location.href=data.data.redirectionUrl;return;}},};});});