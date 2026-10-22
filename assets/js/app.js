var cl = console.log;

const Base_url = "https://xhr-1st-crud-default-rtdb.firebaseio.com";
const Food_url = `${Base_url}/Foods.json`;

const form = document.getElementById("form");
const spinner = document.getElementById("spinner");
const list = document.getElementById("list");

const Food = document.getElementById("Food");
const Chef = document.getElementById("Chef");

const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");

// State
let state = {
    FoodArr: [],
    Edit_Id: null
};

// Snackbar
function Snakbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2500
    });
}

// Spinner
function Handlespinner() {
    spinner.classList.toggle("d-none");
}

// Rendering
function Rendering(arr) {
    let result = ``;

    arr.forEach(ele => {
        result += `
        <li class="list-group-item d-flex justify-content-between align-items-center"
            id="${ele.id}">

            <div>
                <strong>${ele.food}</strong>
                <p class="mb-0 text-muted">${ele.chef}</p>
            </div>

            <div>
                <button class="btn btn-primary btn-sm"
                    onclick="OnEditList(this)">Edit</button>

                <button class="btn btn-danger btn-sm"
                    onclick="DeleteList(this)">Delete</button>
            </div>

        </li>`;
    });

    list.innerHTML = result;
}

// Read
async function Show() {
    Handlespinner();

    try {
        let res = await fetch(Food_url, {
            method: "GET",
            body: null,
            headers: {
                "Content-Type": "application/json"
            }
        });

        let data = await res.json();

        state.FoodArr = [];

        for (const key in data) {
            data[key].id = key;
            state.FoodArr.unshift(data[key]);
            Rendering(state.FoodArr);
        }

        if (!data) {
            Rendering(state.FoodArr);
        }

    } catch (err) {
        cl(err);
    } finally {
        Handlespinner();
    }
}

Show();

// Create
async function CreateData(eve) {
    eve.preventDefault();
    Handlespinner();

    try {
        let obj = {
            food: Food.value,
            chef: Chef.value
        };

        let res = await fetch(Food_url, {
            method: "POST",
            body: JSON.stringify(obj),
            headers: {
                "Content-Type": "application/json"
            }
        });

        let data = await res.json();

        obj.id = data.name;

        state.FoodArr.unshift(obj);

        Rendering(state.FoodArr);

        Snakbar("New Food Added", "success");
        form.reset();

    } catch (err) {
        cl(err);
    } finally {
        Handlespinner();
    }
}

// Edit
function OnEditList(eve) {
    let Edit_id = eve.closest("li").id;

    state.Edit_Id = Edit_id;

    let Edit_obj = state.FoodArr.find(
        t => t.id === Edit_id
    );

    Food.value = Edit_obj.food;
    Chef.value = Edit_obj.chef;

    submitBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");
}

// Update
async function UpdateList() {
    Handlespinner();

    let Update_id = state.Edit_Id;

    try {
        let update_obj = {
            food: Food.value,
            chef: Chef.value
        };

        let Update_url =
            `${Base_url}/Foods/${Update_id}.json`;

        let res = await fetch(Update_url, {
            method: "PATCH",
            body: JSON.stringify(update_obj),
            headers: {
                "Content-Type": "application/json"
            }
        });

        let data = await res.json();

        let index = state.FoodArr.findIndex(
            t => t.id === Update_id
        );

        state.FoodArr[index] = {
            ...data,
            id: Update_id
        };

        let li = document.getElementById(Update_id);

        li.querySelector("strong").innerText = data.food;
        li.querySelector("p").innerText = data.chef;

        submitBtn.classList.remove("d-none");
        updateBtn.classList.add("d-none");

        state.Edit_Id = null;

        Snakbar("Food Updated", "success");
        form.reset();

    } catch (err) {
        cl(err);
    } finally {
        Handlespinner();
    }
}

// Delete
async function DeleteList(eve) {
    let Remove_id = eve.closest("li").id;

    let result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
        Handlespinner();

        try {
            let Remove_url =
                `${Base_url}/Foods/${Remove_id}.json`;

            let res = await fetch(Remove_url, {
                method: "DELETE",
                body: null,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            let index = state.FoodArr.findIndex(
                t => t.id === Remove_id
            );

            state.FoodArr.splice(index, 1);

            eve.closest("li").remove();

            Snakbar("Food Removed!", "success");

        } catch (err) {
            cl(err);
        } finally {
            Handlespinner();
        }
    }
}

// Events
form.addEventListener("submit", CreateData);
updateBtn.addEventListener("click", UpdateList);
