import { LightningElement, api, track, wire } from 'lwc';
import getContactRecordsUsingRestApi from '@salesforce/apex/ListViewExportController.getContactRecordsUsingRestApi';
import getListView from '@salesforce/apex/ListViewExportController.getListViewColumns';
import getRecords from '@salesforce/apex/ListViewExportController.getRecords';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getListViewapiName from '@salesforce/apex/ListViewExportController.getListViewFilterName';

export default class ListViewExportLWC extends NavigationMixin(LightningElement) {
    @api objectApiName;    
    @api listViewApiName;  
    @api recordIdsCsv;     
    @api fieldNamesCsv;
    @api sessionId;   

    @track columns = [];
    @track recordIds = [];
    @track selectedAccounts = [];

    connectedCallback() {
        console.log('Object Name >>', this.objectApiName);
        console.log('List View Name >>', this.listViewApiName);
        console.log('Record Ids CSV >>', this.recordIdsCsv);
        console.log('Field Names CSV >>', this.fieldNamesCsv);
        console.log('Session Id >>', this.sessionId);
        
        if (this.fieldNamesCsv) {
            this.columns = this.fieldNamesCsv.split(',').map(f => f.trim());
        }

        if (this.recordIdsCsv) {
            this.recordIds = this.recordIdsCsv.split(',').map(id => id.trim());
        }

        this.waitForWireDataAndDownload();
        
    }
   

    wireServiceResponse;
    @wire(getContactRecordsUsingRestApi, { filterId: '$listViewApiName', sessionId: '$sessionId' })
    async wiredContacts(response) {
        refreshApex(response)
        console.log("Response is" + response);

        this.wireServiceResponse = response;
        let data = response.data;
        let error = response.error;

        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.selectedAccounts = parsed.map(element => element.Id);
                console.log('Parsed contacts:', parsed);
            } catch (e) {
                this.showErrorToast(e.body.message);
            }
        }
        if (error) {
            this.showErrorToast(error.body.message);
            
        }
    }    


    wireServiceResponse2;
    @wire(getListView, { filterId: '$listViewApiName', sessionId: '$sessionId' })
    async wiredCLIst(response) {
        refreshApex(response)
        console.log("Response is" + response);

        this.wireServiceResponse2 = response;
        let data = response.data;
        let error = response.error;

        if (data) {
            const fieldNames = JSON.parse(data);
            console.log('Field Names:', fieldNames);
            
            this.columnsList = fieldNames;
        }
        if (error) {
            console.error('Error fetching contacts:', error);
            this.showErrorToast(error.body.message);
            
        }
    }


    @track listViewName = '';
    wireServiceResponse3;
    @wire(getListViewapiName, { filterId: '$listViewApiName' })
    async wiredCLIstResponese   (response) {
        refreshApex(response)
        console.log("Response is" + response);

        this.wireServiceResponse3 = response;
        let data = response.data;
        let error = response.error;

        if (data) {
            this.listViewName = data;
            console.log('Shreyash Filter Name >>', this.listViewName);
        }
        if (error) {
            console.error('Error fetching contacts:', error);
            this.showErrorToast(error.body.message);
            
        }
    }



   waitForWireDataAndDownload(retries = 10) {
    const hasSelectedAccounts = Array.isArray(this.selectedAccounts) && this.selectedAccounts.length > 0;
    const hasColumnsList = Array.isArray(this.columnsList) && this.columnsList.length > 0;

    if (hasSelectedAccounts && hasColumnsList) {
        console.log('Wire data loaded, starting download...');
        this.downloadExcel();
    } else if (retries > 0) {
        console.log(`Waiting for wire data... ${retries} retries left`);
        setTimeout(() => this.waitForWireDataAndDownload(retries - 1), 500); // retry after 500ms
    } else {
        this.showErrorToast('Wire data failed to load in time. Please try again.');
    }
}



    downloadExcel() {
        this.navigateToAccountListView();
        getRecords({
            sobjectApiName: this.objectApiName,
            fieldNames: this.columnsList,
            recordIds: this.selectedAccounts
        })
            .then(data => {
                if (data && data.length > 0) {
                    let doc = '<table>';
                    doc += '<style>';
                    doc += 'table, th, td {';
                    doc += '    border: 1px solid black;';
                    doc += '    border-collapse: collapse;';
                    doc += '}';
                    doc += '</style>';

                    
                    doc += '<tr>';
                    this.columnsList.forEach(col => {
                        doc += `<th>${col}</th>`;
                    });
                    doc += '</tr>';

                    
                    data.forEach(record => {
                        doc += '<tr>';
                        this.columnsList.forEach(col => {
                            const value = record[col] != null ? record[col] : '';
                            doc += `<td>${value}</td>`;
                        });
                        doc += '</tr>';
                    });

                    doc += '</table>';

                    
                    const element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
                    const downloadElement = document.createElement('a');
                    downloadElement.href = element;
                    downloadElement.target = '_self';
                    downloadElement.download = `${this.listViewName} || 'Export'}.xls`;
                    document.body.appendChild(downloadElement);
                    downloadElement.click();
                } else {
                    //alert('No data returned from Apex.');
                    this.showErrorToast('No data returned from Apex.');
                }
            })
            .catch(error => {
                console.error('Error fetching data for export:', error);  

                if( error.body.message == 'Invalid field Owner.Alias for Account'){
                        this.showErrorToast(error.body.message + '. Please remove this field.');
                }
                if( error.body.message == 'Invalid field RecordType.Name for Account'){
                        this.showErrorToast(error.body.message + '. Please remove this field.');
                }
            });
    }


    navigateToAccountListView() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.objectApiName,
                actionName: 'list'
            },
            state: {
                filterName: this.listViewName
            },
        });
    }


    showSuccessToast(message) {
        const event = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    // Error Toast
    showErrorToast(message) {
        const event = new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }


}
