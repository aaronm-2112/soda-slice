/* Contains Jquery and UI liraries for testing what fails when an update to new version of Electron occurs. Also includes IPC calls 
   as newer versions of Electron changed how they do IPC calls. 
   
   Goal is to include a bit of what can fail, fix ech issue and then create a build. If that build works that is a good estimate of the time it will take.
   
*/ 

// wait until the document is ready
$(document).ready(() => {


// create sub header for accordion in the slice html 
let h3Accordion = $("<h3>Jquery and libraries - Accordion</h3>")
$('#slice-jquery-accordion').prepend(h3Accordion)

// create the Semantic UI Accordion in the UI under the Jquery Libraries - Accordion section 
// open the first section of the accordion for first time user navigation to the section
let dsAccordion = $("#slice-accordion").accordion();
dsAccordion.accordion("open", 0);

// initialize the tagify input in the Tagify section of the slice 
// let sliceTagifyInput = $('#slice-tagify')
// console.log(sliceTagifyInput)
// let sliceTagify = new Tagify(sliceTagifyInput)

// $('#load-tagify-btn').on('click', async (e) => {
//     sliceTagify.loading()

//     // add timeout 
//     await sleep(2000)

//     sliceTagify.addTags([{value: "shape", color: "green"}, {value: "core", color: "grey"}])

//     sliceTagify.loading()
// })

// sleep function to show loading works 
const sleep = (ms) => {
    return new Promise((rej, res) => {
        setTimeout(() => {
            console.log("Loading tags")
            res()
        }, ms)
    })
}

// Sweet alert popup section of the code 
// Runs when user clicks the button
$("#sweet-alert-btn").on("click", async (e) => {
    let res = await Swal.fire({
        title: "A test sweet alert",
        icon: "Success",
        text: "Some text",
        showConfirmButton: true, 
        heightAuto: false, 
        backfrop: "rgba(0,0,0, 0.4)"
    })

    alert(`Result is: ${res}`)
})



// h2 ipcRenderer section integrate ORCID iD
$("#ipc-btn-1").on("click", () => {
    // send url to create a window and reach out to ORICD
    ipcRenderer.send(
        "orcid",
        "https://orcid.org/oauth/authorize?client_id=APP-J86O4ZY7LKQGWJ2X&response_type=code&scope=/authenticate&redirect_uri=https://app.pennsieve.io/orcid-redirect"
      );
    
      // handle the reply from the asynhronous message to sign the user into Pennsieve
      ipcRenderer.on("orcid-reply", async (event, accessCode) => {
        if (!accessCode || accessCode === "") {
          return;
        }

        alert("Access code received: ", accessCode)
      });
})




})




