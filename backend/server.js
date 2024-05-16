const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/queso_artesanal');

// Schemas and Models
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const DeliveryGuySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
});

const CustomerSchema = new mongoose.Schema({
  name: String,
  address: String,
});

const OrderSchema = new mongoose.Schema({
  name: String,
  address: String,
  product: String,
  status: { type: String, default: 'pending' },
});

const CartSchema = new mongoose.Schema({
  product: String,
});

const User = mongoose.model('User', UserSchema);
const DeliveryGuy = mongoose.model('DeliveryGuy', DeliveryGuySchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Order = mongoose.model('Order', OrderSchema);
const Cart = mongoose.model('Cart', CartSchema);

// Routes

// Authentication
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).send('Invalid credentials');
  }
  const token = jwt.sign({ userId: user._id }, 'secret_key');
  res.send({ token });
});

// Users
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  res.status(201).send(newUser);
});

// Delivery Guys
app.get('/delivery-guys', async (req, res) => {
  const deliveryGuys = await DeliveryGuy.find();
  res.send(deliveryGuys);
});

app.post('/delivery-guys', async (req, res) => {
  const { name, email, phone } = req.body;
  const newDeliveryGuy = new DeliveryGuy({ name, email, phone });
  await newDeliveryGuy.save();
  res.status(201).send(newDeliveryGuy);
});

// Customers
app.get('/customers', async (req, res) => {
  const customers = await Customer.find();
  res.send(customers);
});

app.post('/customers', async (req, res) => {
  const { name, address } = req.body;
  const newCustomer = new Customer({ name, address });
  await newCustomer.save();
  res.status(201).send(newCustomer);
});

// Orders
app.get('/orders', async (req, res) => {
  const orders = await Order.find();
  res.send(orders);
});

app.post('/orders', async (req, res) => {
  const { name, address, product } = req.body;
  const newOrder = new Order({ name, address, product });
  await newOrder.save();
  res.status(201).send(newOrder);
});

app.put('/orders/:id', async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  order.status = status;
  await order.save();
  res.send(order);
});

// Cart
app.get('/cart', async (req, res) => {
  const cart = await Cart.find();
  res.send(cart);
});

app.post('/cart', async (req, res) => {
  const { product } = req.body;
  const newCartItem = new Cart({ product });
  await newCartItem.save();
  res.status(201).send(newCartItem);
});

app.delete('/cart', async (req, res) => {
  await Cart.deleteMany();
  res.send('Cart cleared');
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
