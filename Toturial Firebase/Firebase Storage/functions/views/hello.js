class Hello {
 
    constructor() {
        this.file;
        this.title="your title";
        this.alt="your alt";
        document.getElementById('title').value = this.title;
        document.getElementById('alt').value = this.alt;
    }

    onSelectIMage(files) {
        this.file = files;
        console.log(this.file)
    }
    refreshForm() {
        document.getElementById('title').value = this.title;
        document.getElementById('alt').value = this.alt;
    }

    clearData(){
        this.file = '';
        this.title = '';
        this.alt = '';
        this.refreshForm();
    }

    displayValueInput() {
        this.title = document.getElementById('title').value 
        this.alt = document.getElementById('alt').value 

        var formData = new FormData();

        formData.append("title", this.title);
        formData.append("alt", this.alt);

        for (let index = 0; index < this.file.length; index++)
            formData.append("file", this.file[index]);

        
       


        var request = new XMLHttpRequest();
        request.upload.onprogress = this.update_progress;
        request.addEventListener("load", this.transfer_complete, false);
		request.addEventListener("error",  this.transfer_failed, false);
        request.addEventListener("abort",  this.transfer_canceled, false);	
        
        request.onreadystatechange =  () =>{
            if (request.readyState === 4) {
                console.log(request.response);
                this.clearData();
            }
        }

        request.open("POST", "https://us-central1-toturial-firebase2020.cloudfunctions.net/abdo/upload",true);
        request.send(formData);
        //window.location.href = "/upload";
    }

    update_progress(e) {
        if (e.lengthComputable) {
            var percentage = Math.round((e.loaded / e.total) * 100);
            console.log("percent " + percentage + '%');
        }
        else {
            console.log("Unable to compute progress information since the total size is unknown");
        }
    }


     transfer_complete(e){console.log("The transfer is complete.");}
	 transfer_failed(e){console.log("An error occurred while transferring the file.");}
	 transfer_canceled(e){console.log("The transfer has been canceled by the user.");}


}


var Firebase = new Hello();



