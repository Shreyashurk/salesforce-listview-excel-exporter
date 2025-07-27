public with sharing class ListViewExportController {
    public List<Account> selAccLst;
    public String recordIds;
    public String filterId;

    public ListViewExportController(ApexPages.StandardSetController controller) {
        selAccLst = (List<Account>)controller.getSelected();
        filterId = controller.getFilterId();
        System.debug('filterId: ' + filterId);

        recordIds = '';
        for (Account acc : selAccLst) {
            recordIds += acc.Id + ',';
        }
        recordIds = recordIds.removeEnd(',');
        System.debug('recordIds: ' + recordIds);
    }

    public PageReference redirectToLC() {
        System.debug('filterId: ' + filterId);
        

        String baseUrl = System.Url.getOrgDomainUrl().toExternalForm();
        String sessionId = UserInfo.getSessionId().substring(15);

        System.debug('recordIds: ' + recordIds);
        System.debug('Session Id: ' + sessionId);

        String redirectUrl = baseUrl + '/lightning/cmp/c__ListViewExportAura'
            + '?c__filterName=' + filterId
            + '&c__selectedRecords=' + recordIds
            + '&c__sessionId=' + sessionId
            + '&c__Object=Account';

        PageReference pgReturnPage = new PageReference(redirectUrl);
        pgReturnPage.setRedirect(true);
        return pgReturnPage;
    }

    
    
    @AuraEnabled(Cacheable=true)
    public static string getContactRecordsUsingRestApi(String filterId, String sessionId){
        try{            
            Http http = new Http();
            HTTPRequest httpReq = new HTTPRequest();
            String orgDomain = System.URL.getOrgDomainUrl().toExternalForm();
            String endpoint = orgDomain + '/services/data/v58.0/sobjects/Account/listviews/' + filterId + '/describe';            
            httpReq.setEndpoint(endpoint);
            httpReq.setMethod('GET');
            httpReq.setHeader('Content-Type', 'application/json; charset=UTF-8');
            httpReq.setHeader('Accept', 'application/json');            
            String Authorization = 'Bearer ' + sessionId;            
            httpReq.setHeader('Authorization', Authorization);            
            
            if ( Test.isRunningTest() ){
                return 'test';
            }
            
            HTTPResponse httpRes = http.send(httpReq);
            
            String ResponseBody = httpRes.getBody();
            Map<String, Object> mapResponse = (Map<String, Object>)JSON.deserializeUntyped(ResponseBody);            
            
            String query = (String) mapResponse.get('query');            
            List<SObject> records = Database.query(query);  
            system.debug('Shreyash >> ' + records);
             system.debug('Size Shhh >> ' + records.size());
            return JSON.serialize(records);
            
        } catch ( Exception e ){
            throw new AuraHandledException(e.getMessage());
        }
	}
    
    @AuraEnabled(Cacheable=true)
    public static String getListViewColumns(String filterId, String sessionId) {
        try{
            Http http = new Http();
            HTTPRequest httpReq = new HTTPRequest();
            String orgDomain = System.URL.getOrgDomainUrl().toExternalForm();
            String endpoint = orgDomain + '/services/data/v58.0/sobjects/Account/listviews/' + filterId + '/describe';
            httpReq.setEndpoint(endpoint);
            httpReq.setMethod('GET');
            httpReq.setHeader('Content-Type', 'application/json; charset=UTF-8');
            httpReq.setHeader('Accept', 'application/json');
            httpReq.setHeader('Authorization', 'Bearer ' + sessionId);
        
            if (Test.isRunningTest()) {
                return 'test';
            }
        
            HTTPResponse httpRes = http.send(httpReq);
        
            if (httpRes.getStatusCode() != 200) {
                throw new AuraHandledException('Callout failed: ' + httpRes.getStatus() + ' - ' + httpRes.getBody());
            }
        
            String responseBody = httpRes.getBody();
            System.debug('Response Body Shreyash: ' + responseBody);  
        
            Map<String, Object> mapResponse = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
            List<Object> columns = (List<Object>)mapResponse.get('columns');
                
            List<String> fieldPaths = new List<String>();
                
            for (Object colObj : columns) {
               Map<String, Object> colMap = (Map<String, Object>)colObj;
               if (colMap.containsKey('fieldNameOrPath')) {
                  fieldPaths.add((String)colMap.get('fieldNameOrPath'));
               }
            }
        
            System.debug('Shreyash Columns >> ' + fieldPaths);
            return JSON.serialize(fieldPaths);    
        }
         catch ( Exception e ){
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getRecords(String sobjectApiName, List<String> fieldNames, List<Id> recordIds) {
        try{
            if (String.isBlank(sobjectApiName) || fieldNames == null || recordIds == null) {
                return new List<Map<String, Object>>();
            }
        
            String soql = 'SELECT ' + String.join(fieldNames, ',') + ' FROM ' + sobjectApiName + ' WHERE Id IN :recordIds';
            List<SObject> records = Database.query(soql);
        
            List<Map<String, Object>> result = new List<Map<String, Object>>();
            for (SObject rec : records) {
                Map<String, Object> row = new Map<String, Object>();
                for (String field : fieldNames) {
                    row.put(field, rec.get(field));
                }
                result.add(row);
            }
            system.debug('Utkarsh >> ' + result);
            return result;
        }
         catch ( Exception e ){
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    
    @AuraEnabled(Cacheable=true)
    public static String getListViewFilterName(String filterId) {
        try{
            ListView lv = [SELECT DeveloperName, SobjectType FROM ListView WHERE Id = :filterId LIMIT 1];
            System.debug(lv.DeveloperName);
            return lv.DeveloperName;
        }
         catch ( Exception e ){
            throw new AuraHandledException(e.getMessage());
        }
    }


}
