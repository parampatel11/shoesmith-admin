'use client'

import { useEffect, useState } from 'react'
import Fuse from 'fuse.js'
import Link from 'next/link'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [soldOrders, setSoldOrders] = useState([])
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [search, setSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [deliveredSearch, setDeliveredSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const usersRes = await fetch('/api/admin/users')
      const ordersRes = await fetch('/api/admin/orders')

      const usersData = await usersRes.json()
      const ordersData = await ordersRes.json()

      setUsers(usersData.users)

      const now = new Date()
      const sold = []
      const delivered = []

      ordersData.orders.forEach(order => {
        const orderDate = new Date(order.createdAt)
        const deliveryTime = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000)

        if (deliveryTime <= now) {
          delivered.push(order)
        } else {
          sold.push(order)
        }
      })

      setSoldOrders(sold)
      setDeliveredOrders(delivered)
    }

    fetchData()
  }, [])

  function groupOrdersByUserAndDate(orders) {
    const grouped = {}
    orders.forEach(order => {
      const userName = order.user?.name
      const date = new Date(order.createdAt).toDateString()

      if (!grouped[userName]) grouped[userName] = {}
      if (!grouped[userName][date]) {
        grouped[userName][date] = {
          user: order.user,
          orders: [],
        }
      }

      grouped[userName][date].orders.push({
        cart: order.cart,
        createdAt: order.createdAt,
      })
    })

    return grouped
  }

  const userFuse = new Fuse(users, {
    keys: ['name', 'email'],
    threshold: 0.4,
  })

  const filteredUsers = search
    ? userFuse.search(search).map(result => result.item)
    : users

  const soldGrouped = groupOrdersByUserAndDate(soldOrders)
  const deliveredGrouped = groupOrdersByUserAndDate(deliveredOrders)

  const soldFuse = new Fuse(
    Object.entries(soldGrouped).map(([username, dates]) => ({
      username,
      user: Object.values(dates)[0].user,
      dates,
    })),
    { keys: ['username', 'user.email'], threshold: 0.4 }
  )

  const deliveredFuse = new Fuse(
    Object.entries(deliveredGrouped).map(([username, dates]) => ({
      username,
      user: Object.values(dates)[0].user,
      dates,
    })),
    { keys: ['username', 'user.email'], threshold: 0.4 }
  )

  const filteredSoldGroups = orderSearch
    ? soldFuse.search(orderSearch).map(res => res.item)
    : Object.entries(soldGrouped).map(([username, dates]) => ({
        username,
        user: Object.values(dates)[0].user,
        dates,
      }))

  const filteredDeliveredGroups = deliveredSearch
    ? deliveredFuse.search(deliveredSearch).map(res => res.item)
    : Object.entries(deliveredGrouped).map(([username, dates]) => ({
        username,
        user: Object.values(dates)[0].user,
        dates,
      }))

  function formatRemainingTime(createdAt) {
    const deliveryTime = new Date(new Date(createdAt).getTime() + 2 * 24 * 60 * 60 * 1000)
    const now = new Date()
    const diff = deliveryTime - now

    if (diff <= 0) return 'Delivered'

    const seconds = Math.floor(diff / 1000) % 60
    const minutes = Math.floor(diff / 1000 / 60) % 60
    const hours = Math.floor(diff / 1000 / 60 / 60) % 24
    const days = Math.floor(diff / 1000 / 60 / 60 / 24)

    return `${days}d ${hours}h ${minutes}m ${seconds}s left`
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 md:px-8 space-y-8">
      <div className='flex justify-center items-center gap-6'>
      <h1 className="text-3xl font-bold text-[#4ED7F1] text-center">Admin Dashboard</h1>
        <Link href="/tips" className="bg-[#4ED7F1] text-black font-semibold text-2xl px-4 py-2 rounded-md cursor-pointer">View Tips</Link>
      </div>
    
      {/* === Logged-in Users === */}
      <div className="bg-[#111] p-4 md:p-6 rounded-lg shadow-md max-h-[500px] overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 sticky top-0 bg-[#111] z-10 py-2">
          <h2 className="text-xl font-semibold text-[#4ED7F1]">Logged In Users ({filteredUsers.length})</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full md:w-72 bg-black border border-[#4ED7F1] text-[#4ED7F1] px-4 py-2 rounded placeholder:text-[#4ED7F1]"
          />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#4ED7F1]">
              <img src={user.image} alt={user.name} className="w-14 h-14 rounded-full border border-[#4ED7F1] object-cover" />
              <div>
                <div className="text-[#4ED7F1] font-semibold">@{user.name}</div>
                <div className="text-gray-400 text-sm">{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === Sold Products === */}
      <div className="bg-[#111] p-4 md:p-6 rounded-lg shadow-md max-h-[500px] overflow-y-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-[#111] z-10 py-2">
          <h2 className="text-xl font-semibold text-[#4ED7F1]">Sold Products</h2>
          <input
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full md:w-72 bg-black border border-[#4ED7F1] text-[#4ED7F1] px-4 py-2 rounded placeholder:text-[#4ED7F1]"
          />
        </div>

        {filteredSoldGroups.map(({ username, user, dates }, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={user?.image} alt={username} className="w-12 h-12 rounded-full border border-[#4ED7F1]" />
              <h3 className="text-lg text-[#4ED7F1] font-semibold">@{username}</h3>
            </div>
            {Object.entries(dates).map(([date, group], j) => (
              <div key={j} className="border border-[#4ED7F1] rounded-lg p-4 bg-[#1a1a1a]">
                <div className="text-sm text-gray-300 mb-2">Order Date: {date}</div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {group.orders.map((order, k) =>
                    order.cart.map((item, idx) => (
                      <div key={idx} className="border border-[#4ED7F1] p-3 rounded bg-black space-y-2">
                        <img src={item.image} alt={item.name} className="w-full h-48 object-contain rounded bg-[#0e0e0e] p-2" />
                        <div className="text-[#4ED7F1] font-medium">{item.name}</div>
                        <div className="text-sm">Price: ₹{item.price}</div>
                        <div className="text-sm">Quantity: {item.quantity}</div>
                        <div className="text-sm text-yellow-400">
                          {formatRemainingTime(order.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* === Delivered Products === */}
      <div className="bg-[#111] p-4 md:p-6 rounded-lg shadow-md max-h-[500px] overflow-y-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-[#111] z-10 py-2">
          <h2 className="text-xl font-semibold text-green-400">Delivered Products</h2>
          <input
            value={deliveredSearch}
            onChange={(e) => setDeliveredSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full md:w-72 bg-black border border-green-400 text-green-300 px-4 py-2 rounded placeholder:text-green-300"
          />
        </div>

        {filteredDeliveredGroups.map(({ username, user, dates }, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={user?.image} alt={username} className="w-12 h-12 rounded-full border border-green-400" />
              <h3 className="text-lg text-green-300 font-semibold">@{username}</h3>
            </div>
            {Object.entries(dates).map(([date, group], j) => (
              <div key={j} className="border border-green-400 rounded-lg p-4 bg-[#1a1a1a]">
                <div className="text-sm text-gray-300 mb-2">Order Date: {date}</div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {group.orders.map((order, k) =>
                    order.cart.map((item, idx) => (
                      <div key={idx} className="border border-green-400 p-3 rounded bg-black space-y-2">
                        <img src={item.image} alt={item.name} className="w-full h-48 object-contain rounded bg-[#0e0e0e] p-2" />
                        <div className="text-green-300 font-medium">{item.name}</div>
                        <div className="text-sm">Price: ₹{item.price}</div>
                        <div className="text-sm">Quantity: {item.quantity}</div>
                        <div className="text-sm text-green-400">
                          Delivered on {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
