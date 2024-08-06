const nameCheckbox = document.getElementById("nameToggle");
const allChooserGroups = document.getElementById("allChooserGroups");

const authorCheckbox = document.getElementById("authorToggle");
const authorDisplayText = document.getElementById("authorDisplayText");

function ToggleNames()
{
    if(nameCheckbox.checked)
        allChooserGroups.style.display = "flex";
    else
        allChooserGroups.style.display = "none";
}

function ToggleAuthor()
{
    console.log(authorCheckbox.checked);

    if(authorCheckbox.checked)
        authorDisplayText.style.display = "inline";
    else
        authorDisplayText.style.display = "none";
}