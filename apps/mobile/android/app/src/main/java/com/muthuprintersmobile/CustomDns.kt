package com.muthuprintersmobile

import okhttp3.Dns
import java.net.InetAddress
import java.net.UnknownHostException
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.concurrent.TimeUnit

class CustomDns : Dns {
    override fun lookup(hostname: String): List<InetAddress> {
        val targetDomain = "muthuprinters.pinnaclesystems.co.in"
        val fallbackIp = "193.203.160.198"

        return try {
            val executor = Executors.newSingleThreadExecutor()
            val future: Future<List<InetAddress>> = executor.submit(Callable {
                InetAddress.getAllByName(hostname).toList()
            })

            try {
                // Wait up to 3 seconds for standard system DNS
                future.get(3, TimeUnit.SECONDS)
            } catch (e: Exception) {
                future.cancel(true)
                throw UnknownHostException("System DNS failed or timed out for $hostname")
            } finally {
                executor.shutdown()
            }
        } catch (e: Exception) {
            if (hostname == targetDomain) {
                try {
                    return listOf(InetAddress.getByName(fallbackIp))
                } catch (ex: Exception) {
                    throw UnknownHostException("Fallback IP invalid for $hostname")
                }
            }
            throw UnknownHostException("Failed to resolve $hostname: ${e.message}")
        }
    }
}
