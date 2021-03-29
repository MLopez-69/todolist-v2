//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const itemSchema = {
  name: String
}


const Item = mongoose.model("Item", itemSchema);



const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]

};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  const sideArray = [];

  List.find({}, function(err, foundLists) {
    if (err) {
      console.log(err)
    } else {
      sideArray.push(foundLists);

      Item.find({}, function(err, foundItems) {


        if (foundItems.length === 0) {
          Item.insertMany(defaultItems, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log("successfully saved items to database");
            }

            res.redirect("/");
          });



        } else {
          res.render("list", {
            listTitle: "today",
            newListItems: foundItems,
            sideArray: foundLists
          });
        }

      });
    }
  });
});

app.get("/:customListName", function(req, res) {

  const sideArray = [];


  List.find({}, function(err, foundLists) {


    sideArray.push(foundLists);

    const customListName = _.capitalize(req.params.customListName);
    List.findOne({
      name: customListName
    }, function(err, foundList) {
      if (!err) {
        if (!foundList) {
          const list = new List({
            name: customListName,
            items: defaultItems
          });

          list.save(function(err, result) {
            res.redirect("/" + customListName);
          });



        } else {
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items,
            sideArray: foundLists
          });
        }

      }
    });
  });
});



app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "today") {
    item.save(function(err,result){
      res.redirect("/");
    });

  } else {
    // List.findOne({
    //   name: listName
    // }, function(err, foundList) {
    //   foundList.items.push(item);
    //   foundList.save();
    //   res.redirect("/" + listName);

    List.findOneAndUpdate({
      name: listName
    }, {
      $push: {
        items: item
      }
    }, function(err) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "today") {

    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });


  }


});




app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
