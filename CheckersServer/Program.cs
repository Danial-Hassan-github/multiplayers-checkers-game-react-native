using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Net;
//using System.Net.WebSockets;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using WebSocketSharp;
using Newtonsoft.Json;
using Fleck;
namespace CheckersServer
{
    class Program
    {
        public string PlayerString{ set; get; }
        static List<IWebSocketConnection> clients = new List<IWebSocketConnection>();
        static void Main(string[] args)
        {
            string PlayerString = "";
            string killedString = "";
            //string Player1_Name = "";
            //string Player2_Name = "";
            var server = new WebSocketServer("ws://192.168.206.32:9254");
            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    Console.WriteLine("Client connected");
                    if (clients.Count == 0)
                    {
                        clients.Add(socket);
                        socket.Send("0");
                    }
                    else if (clients.Count == 1)
                    {
                        clients.Add(socket);
                        socket.Send("1");
                        for (int i=0;i<2;i++)
                        {
                            clients[i].Send("Player_02_Joined");
                        }
                    }
                    else
                    {
                        clients.Add(socket);
                        socket.Send(PlayerString);
                    }
                };
                socket.OnMessage = message =>
                {
                    Console.WriteLine("Received data: " + message);
                    if (message.Contains("has")&&!message.Contains(":"))
                    {
                        PlayerString += message+"\n";
                        for (int i = 0; i < clients.Count; i++)
                        {
                            clients[i].Send(PlayerString);
                        }
                        return;
                    }
                    if (message=="close")
                    {
                        for (int i = 0; i < clients.Count; i++)
                        {
                            clients[i].Close();
                        }
                    }
                    if (message.Contains(",") && !message.Contains(":")&&!message.Contains("[["))
                    {
                        killedString += message;
                        message = killedString;
                        for (int i = 0; i < clients.Count; i++)
                        {
                            clients[i].Send(killedString);
                        }
                        return;
                    }
                    for (int i = 0; i < clients.Count; i++)
                    {
                        clients[i].Send(message);
                    }
                    // Check if received message is message
                    //if (message.Contains(":"))
                    //{
                    //    for (int i = 0; i < clients.Count; i++)
                    //    {
                    //        clients[i].Send(message);
                    //    }
                    //}
                    //// Check if received message is list
                    //if (message.Contains("]]"))
                    //{
                    //    // Send a response back to the client
                    //    for (int i=0;i<clients.Count;i++)
                    //    {
                    //        clients[i].Send(message);
                    //    }
                    //}
                    //// Check if received message is "black" or "white" to set player
                    //if (message=="black" || message=="white")
                    //{
                    //    for (int i = 0; i < clients.Count; i++)
                    //    {
                    //        clients[i].Send(message);
                    //    }
                    //}
                };

                socket.OnClose = () =>
                {
                    if (clients.Count>=2)
                    {
                        if (clients[0]==socket||clients[1]==socket)
                        {
                            string winner = "black wins!";
                            if (!clients[0].IsAvailable)
                            {
                                Console.WriteLine("Client disconnected with id:" + 0);
                                winner = "white wins";
                            }
                            else if (!clients[1].IsAvailable)
                            {
                                Console.WriteLine("Client disconnected with id:" + 1);
                            }
                            for (int j = 0; j < clients.Count; j++)
                            {
                                if (clients[j].IsAvailable)
                                {
                                    clients[j].Send(winner);
                                }
                            }
                            clients.Clear();
                        }
                    }
                    else
                    {
                        Console.WriteLine("Client disconnected with id:" + 0);
                        clients.Clear();
                    }
                };
            });

            Console.WriteLine("Server is running...");
            Console.ReadLine();
            
        }
    }
}