/* Contains Jquery and UI liraries for testing what fails when an update to new version of Electron occurs. Also includes IPC calls 
   as newer versions of Electron changed how they do IPC calls. 
   
   Goal is to include a bit of what can fail, fix ech issue and then create a build. If that build works that is a good estimate of the time it will take.
   
*/

const fs = require("fs/promises");

// wait until the document is ready
$(document).ready(() => {
  // create sub header for accordion in the slice html
  let h3Accordion = $("<h3>Jquery and libraries - Accordion</h3>");
  $("#slice-jquery-accordion").prepend(h3Accordion);

  // create the Semantic UI Accordion in the UI under the Jquery Libraries - Accordion section
  // open the first section of the accordion for first time user navigation to the section
  let dsAccordion = $("#slice-accordion").accordion();
  dsAccordion.accordion("open", 0);

  // initialize the tagify input in the Tagify section of the slice
  let sliceTagifyInput = document.querySelector("#slice-tagify");
  let sliceTagify = new Tagify(sliceTagifyInput);

  $("#load-tagify-btn").on("click", async (e) => {
    sliceTagify.loading();

    // add timeout
    await sleep(2000);

    sliceTagify.addTags([
      { value: "shape", color: "green" },
      { value: "core", color: "grey" },
    ]);

    sliceTagify.loading();
  });

  // sleep function to show loading works
  const sleep = (ms) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("Loading tags");
        resolve();
      }, ms);
    });
  };

  // Sweet alert popup section of the code
  // Runs when user clicks the button
  $("#sweet-alert-btn").on("click", async (e) => {
    let res = await Swal.fire({
      title: "A test sweet alert",
      icon: "Success",
      text: "Some text",
      showConfirmButton: true,
      heightAuto: false,
      backfrop: "rgba(0,0,0, 0.4)",
    });

    alert(`Result is: ${res}`);
  });

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

      alert("Access code received: ", accessCode);
    });
  });

  // function for importing a banner image if one already exists
  $("#edit_banner_image_button").click(async () => {
    $("#edit_banner_image_modal").modal("show");
    if ($("#para-current-banner-img").text() === "None") {
      //Do nothing... regular import
    } else {
      let img_src = $("#current-banner-img").attr("src");
      let img_base64 = await getBase64(img_src); // encode image to base64

      $("#image-banner").attr("src", "data:image/jpg;base64," + img_base64);
      $("#save-banner-image").css("visibility", "visible");
      $("#div-img-container-holder").css("display", "none");
      $("#div-img-container").css("display", "block");
      $("#para-path-image").html("path");

      // Look for the security token in the URL. If this this doesn't exist, something went wrong with the aws bucket link.
      let position = img_src.search("X-Amz-Security-Token");

      if (position != -1) {
        // The image url will be before the security token
        let new_img_src = img_src.substring(0, position - 1);
        let new_position = new_img_src.lastIndexOf("."); //

        if (new_position != -1) {
          imageExtension = new_img_src.substring(new_position + 1);

          if (imageExtension.toLowerCase() == "png") {
            $("#image-banner").attr(
              "src",
              "data:image/png;base64," + img_base64
            );
          } else if (imageExtension.toLowerCase() == "jpeg") {
            $("#image-banner").attr(
              "src",
              "data:image/jpg;base64," + img_base64
            );
          } else if (imageExtension.toLowerCase() == "jpg") {
            $("#image-banner").attr(
              "src",
              "data:image/jpg;base64," + img_base64
            );
          } else {
            log.error(`An error happened: ${img_src}`);
            console.log(`An error happened: ${img_src}`);
            Swal.fire({
              icon: "error",
              text: "An error occurred when importing the image. Please try again later.",
              showConfirmButton: "OK",
              backdrop: "rgba(0,0,0, 0.4)",
              heightAuto: false,
            });

            return;
          }
        } else {
          log.error(`An error happened: ${img_src}`);
          console.log(`An error happened: ${img_src}`);

          Swal.fire({
            icon: "error",
            text: "An error occurred when importing the image. Please try again later.",
            showConfirmButton: "OK",
            backdrop: "rgba(0,0,0, 0.4)",
            heightAuto: false,
          });

          return;
        }
      } else {
        log.error(`An error happened: ${img_src}`);
        console.log(`An error happened: ${img_src}`);

        Swal.fire({
          icon: "error",
          text: "An error occurred when importing the image. Please try again later.",
          showConfirmButton: "OK",
          backdrop: "rgba(0,0,0, 0.4)",
          heightAuto: false,
        });

        return;
      }

      myCropper.destroy();
      myCropper = new Cropper(
        document.getElementById("image-banner"),
        cropOptions
      );
    }
  });

  // Action when user click on "Import image" button for banner image
  $("#button-import-banner-image").click(() => {
    $("#para-dataset-banner-image-status").html("");
    console.log("Import image clicked");
    ipcRenderer.send("open-file-dialog-import-banner-image");
  });

  const uploadBannerImage = () => {
    $("#para-dataset-banner-image-status").html("Please wait...");
    //Save cropped image locally and check size
    let imageFolder = path.join(homeDirectory, "SODA", "banner-image");
    let imageType = "";

    if (!fs.existsSync(imageFolder)) {
      fs.mkdirSync(imageFolder, { recursive: true });
    }

    if (imageExtension == "png") {
      imageType = "image/png";
    } else {
      imageType = "image/jpeg";
    }

    let imagePath = path.join(
      imageFolder,
      "banner-image-SODA." + imageExtension
    );
    let croppedImageDataURI = myCropper.getCroppedCanvas().toDataURL(imageType);

    imageDataURI.outputFile(croppedImageDataURI, imagePath).then(() => {
      let image_file_size = fs.statSync(imagePath)["size"];

      if (image_file_size < 5 * 1024 * 1024) {
        alert("Successfully uploaded banner image");
      } else {
        $("#para-dataset-banner-image-status").html(
          "<span style='color: red;'> " +
            "Final image size must be less than 5 MB" +
            "</span>"
        );
      }
    });
  };

  $("#save-banner-image").click((event) => {
    $("#para-dataset-banner-image-status").html("");
    if (bfViewImportedImage.src.length > 0) {
      if (formBannerHeight.value > 511) {
        Swal.fire({
          icon: "warning",
          text: `As per NIH guidelines, banner image must not display animals or graphic/bloody tissues. Do you confirm that?`,
          heightAuto: false,
          backdrop: "rgba(0,0,0, 0.4)",
          showCancelButton: true,
          focusCancel: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          reverseButtons: reverseSwalButtons,
          showClass: {
            popup: "animate__animated animate__zoomIn animate__faster",
          },
          hideClass: {
            popup: "animate__animated animate__zoomOut animate__faster",
          },
        }).then((result) => {
          if (formBannerHeight.value < 1024) {
            Swal.fire({
              icon: "warning",
              text: `Although not mandatory, it is highly recommended to upload a banner image with display size of at least 1024 px. Your cropped image is ${formBannerHeight.value} px. Would you like to continue?`,
              heightAuto: false,
              backdrop: "rgba(0,0,0, 0.4)",
              showCancelButton: true,
              focusCancel: true,
              confirmButtonText: "Yes",
              cancelButtonText: "No",
              reverseButtons: reverseSwalButtons,
              showClass: {
                popup: "animate__animated animate__zoomIn animate__faster",
              },
              hideClass: {
                popup: "animate__animated animate__zoomOut animate__faster",
              },
            }).then((result) => {
              if (result.isConfirmed) {
                uploadBannerImage();
              }
            });
          } else {
            uploadBannerImage();
          }
        });
      } else {
        $("#para-dataset-banner-image-status").html(
          "<span style='color: red;'> " +
            "Dimensions of cropped area must be at least 512 px" +
            "</span>"
        );
      }
    } else {
      $("#para-dataset-banner-image-status").html(
        "<span style='color: red;'> " +
          "Please import an image first" +
          "</span>"
      );
    }
  });

  $(document).ready(() => {
    ipcRenderer.on("selected-banner-image", async (event, path) => {
      if (path.length > 0) {
        let original_image_path = path[0];
        let image_path = original_image_path;
        let destination_image_path = require("path").join(
          homeDirectory,
          "SODA",
          "banner-image-conversion"
        );
        let converted_image_file = require("path").join(
          destination_image_path,
          "converted-tiff.jpg"
        );
        let conversion_success = true;
        imageExtension = path[0].split(".").pop();

        if (imageExtension.toLowerCase() == "tiff") {
          $("body").addClass("waiting");
          Swal.fire({
            title: "Image conversion in progress!",
            html: "Pennsieve does not support .tiff banner images. Please wait while SODA converts your image to the appropriate format required.",
            heightAuto: false,
            backdrop: "rgba(0,0,0, 0.4)",
            showClass: {
              popup: "animate__animated animate__fadeInDown animate__faster",
            },
            hideClass: {
              popup: "animate__animated animate__fadeOutUp animate__faster",
            },
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await Jimp.read(original_image_path)
            .then(async (file) => {
              console.log("starting tiff conversion");
              if (!fs.existsSync(destination_image_path)) {
                fs.mkdirSync(destination_image_path);
              }

              try {
                if (fs.existsSync(converted_image_file)) {
                  fs.unlinkSync(converted_image_file);
                }
              } catch (err) {
                conversion_success = false;
                console.error(err);
              }

              return file.write(converted_image_file, async () => {
                if (fs.existsSync(converted_image_file)) {
                  let stats = fs.statSync(converted_image_file);
                  let fileSizeInBytes = stats.size;
                  let fileSizeInMegabytes = fileSizeInBytes / (1000 * 1000);

                  if (fileSizeInMegabytes > 5) {
                    console.log("File size too large. Resizing image");

                    fs.unlinkSync(converted_image_file);

                    await Jimp.read(original_image_path)
                      .then((file) => {
                        return file
                          .resize(1024, 1024)
                          .write(converted_image_file, () => {
                            document.getElementById(
                              "div-img-container-holder"
                            ).style.display = "none";
                            document.getElementById(
                              "div-img-container"
                            ).style.display = "block";

                            $("#para-path-image").html(image_path);
                            bfViewImportedImage.src = converted_image_file;
                            myCropper.destroy();
                            myCropper = new Cropper(
                              bfViewImportedImage,
                              cropOptions
                            );
                            $("#save-banner-image").css(
                              "visibility",
                              "visible"
                            );
                            $("body").removeClass("waiting");
                          });
                      })
                      .catch((err) => {
                        conversion_success = false;
                        console.error(err);
                      });
                    if (fs.existsSync(converted_image_file)) {
                      let stats = fs.statSync(converted_image_file);
                      let fileSizeInBytes = stats.size;
                      let fileSizeInMegabytes = fileSizeInBytes / (1000 * 1000);

                      if (fileSizeInMegabytes > 5) {
                        console.log(
                          "File size is too big",
                          fileSizeInMegabytes
                        );
                        conversion_success = false;
                        // SHOW ERROR
                      }
                    }
                  }
                  console.log("file conversion complete");
                  image_path = converted_image_file;
                  imageExtension = "jpg";
                  $("#para-path-image").html(image_path);
                  bfViewImportedImage.src = image_path;
                  myCropper.destroy();
                  myCropper = new Cropper(bfViewImportedImage, cropOptions);
                  $("#save-banner-image").css("visibility", "visible");
                }
              });
            })
            .catch((err) => {
              conversion_success = false;
              console.error(err);
              Swal.fire({
                icon: "error",
                text: "Something went wrong",
                confirmButtonText: "OK",
                heightAuto: false,
                backdrop: "rgba(0,0,0, 0.4)",
              });
            });
          if (conversion_success == false) {
            $("body").removeClass("waiting");
            return;
          } else {
            Swal.close();
          }
        } else {
          document.getElementById("div-img-container-holder").style.display =
            "none";
          document.getElementById("div-img-container").style.display = "block";

          $("#para-path-image").html(image_path);
          bfViewImportedImage.src = image_path;
          myCropper.destroy();
          myCropper = new Cropper(bfViewImportedImage, cropOptions);

          $("#save-banner-image").css("visibility", "visible");
        }
      } else {
        if ($("#para-current-banner-img").text() === "None") {
          $("#save-banner-image").css("visibility", "hidden");
        } else {
          $("#save-banner-image").css("visibility", "visible");
        }
      }
    });

    ipcRenderer.on("show-banner-image-below-1024", (event, index) => {
      if (index === 0) {
        uploadBannerImage();
      }
    });
  });

  const showCurrentBannerImage = () => {
    $("#banner_image_loader").show();
    document.getElementById("para-current-banner-img").innerHTML = "";
    alert("Banner image loaded");
  };

  const getBase64 = async (url) => {
    const axios = require("axios");
    return axios
      .get(url, {
        responseType: "arraybuffer",
      })
      .then((response) =>
        Buffer.from(response.data, "binary").toString("base64")
      );
  };

  // read a file on button press
  $("#file-read-btn").on("click", (e) => {
    let file = fs.readFile("/path/to/file");

    console.log(file.text);
  });
});
