public with sharing class OrderController {
    
    // Gets all orders for the logged-in community user
    @AuraEnabled(cacheable=true)
    public static List<Order_Request__c> getMyOrders() {
        return null; // Logic coming in Week 3
    }
    
    // Gets a single order by Id
    @AuraEnabled
    public static Order_Request__c getOrderById(Id orderId) {
        return null; // Logic coming in Week 3
    }
    
    // Creates a new order from the portal form
    @AuraEnabled
    public static void createOrder(Order_Request__c order) {
        // Logic coming in Week 3
    }
    
    // Gets product list from Price Book
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getProducts() {
        return [SELECT Id, Product2.Name, UnitPrice FROM PriceBookEntry WHERE Pricebook2.IsStandard=true AND IsActive = true]; 
    }
}