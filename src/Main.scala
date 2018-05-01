package main.scala

import org.apache.spark.{SparkConf, SparkContext}

object Main extends App {
  //Create a SparkContext to initialize Spark
  val conf = new SparkConf()
  conf.setMaster("local")
  conf.setAppName("Word Count")
  val sc = new SparkContext(conf)

  val RDDtext = sc.textFile("../Scrap_Monster/monsters.json");
  println(RDDtext);
}