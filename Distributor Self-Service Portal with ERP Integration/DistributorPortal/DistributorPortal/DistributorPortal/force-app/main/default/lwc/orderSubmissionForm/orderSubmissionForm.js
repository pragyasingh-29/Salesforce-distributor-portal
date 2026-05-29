import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProducts from '@salesforce/apex/OrderController.getProducts';
import createOrder from '@salesforce/apex/OrderController.createOrder';

export default class OrderSubmissionForm extends LightningElement {

    @track formData = {
        productName: '',
        unitPrice: 0,
        quantity: 1,
        totalAmount: 0,
        description: '',
        requestedDeliveryDate: ''
    };

    @track productOptions = [];
    @track errorMessage = '';
    @track isLoading = false;

    // Price map — matches Price Book values
    productPriceMap = {
        'Industrial Pump A': 5000,
        'Control Valve B': 3000,
        'Pressure Gauge C': 1500
    };

    // Load products when component loads
    connectedCallback() {
        this.loadProducts();
    }

    loadProducts() {
        getProducts()
            .then(result => {
                this.productOptions = result.map(item => ({
                    label: item.Product2.Name,
                    value: item.Product2.Name
                }));
            })
            .catch(error => {
                this.errorMessage = 'Error loading products. Please refresh the page.';
                console.error('Error loading products', error);
            });
    }

    // Handle product selection — auto fill unit price and total
    handleProductChange(event) {
        const selectedProduct = event.detail.value;
        const unitPrice = this.productPriceMap[selectedProduct] || 0;
        const quantity = this.formData.quantity || 1;

        this.formData = {
            ...this.formData,
            productName: selectedProduct,
            unitPrice: unitPrice,
            totalAmount: unitPrice * quantity
        };
    }

    // Handle all other input changes
    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value;

        this.formData = {
            ...this.formData,
            [field]: value
        };

        // Recalculate total if quantity changes
        if (field === 'quantity') {
            this.formData = {
                ...this.formData,
                totalAmount: this.formData.unitPrice * value
            };
        }
    }

    // Handle form submission
    handleSubmit() {
        // Validate form
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const orderData = {
            Product_Name__c: this.formData.productName,
            Quantity__c: this.formData.quantity,
            Unit_Price__c: this.formData.unitPrice,
            Description__c: this.formData.description,
            Requested_Delivery_Date__c: this.formData.requestedDeliveryDate,
            Status__c: 'New'
        };

        createOrder({ order: orderData })
            .then(() => {
                this.showToast('Success', 'Order submitted successfully!', 'success');
                this.resetForm();
            })
            .catch(error => {
                this.errorMessage = error.body.message || 'Error submitting order. Please try again.';
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Form validation
    validateForm() {
        const allValid = [
            ...this.template.querySelectorAll('lightning-input'),
            ...this.template.querySelectorAll('lightning-combobox'),
            ...this.template.querySelectorAll('lightning-textarea')
        ].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);

        if (!allValid) {
            this.errorMessage = 'Please fill in all required fields.';
        }

        return allValid;
    }

    // Show toast notification
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    // Reset form after successful submission
    resetForm() {
        this.formData = {
            productName: '',
            unitPrice: 0,
            quantity: 1,
            totalAmount: 0,
            description: '',
            requestedDeliveryDate: ''
        };
    }
}